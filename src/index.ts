#!/usr/bin/env node
import { cancel, intro, isCancel, log, multiselect, outro, spinner, text } from "@clack/prompts";
import { execa } from "execa";
import { downloadTemplate } from "giget";
import { blue, green, yellow } from "kolorist";
import { builders, parseModule } from "magicast";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const AVAILABLE_TEMPLATES = [
    {
        value: 'tailwindcss',
        label: '🎨 TailwindCSS v4',
        hint: 'Official @tailwindcss/vite integration'
    }
]

type TemplateName = typeof AVAILABLE_TEMPLATES[number]['value']

async function main() {
    intro(`${green('🚀')} ${blue("Nuxt Launchpad Setup")}`)

    const projectName = await text({
        message: "Project name",
        defaultValue: "nuxt-app",
        validate(value) {
            if (value?.length === 0) return "Value is required!"
        },
    })

    if (isCancel(projectName)) {
        cancel("Operation canceled.")
        process.exit(0)
    }

    const selectedTemplates = await multiselect({
        message: "Choose optional features:",
        options: AVAILABLE_TEMPLATES,
        required: false
    })

    if (isCancel(selectedTemplates)) {
        cancel("Operation canceled.")
        process.exit(0)
    }

    const s = spinner()

    const targetDir = path.join(process.cwd(), projectName)
    if (existsSync(targetDir)) {
        s.start(`⚠️ Directory ${projectName} already exists. Cleaning...`)
        rmSync(targetDir, { recursive: true, force: true })
        s.stop(`Cleaned ${projectName}`)
    }

    s.start(`${green('⬇️')} Downloading launchpad...`)
    try {
        await downloadTemplate('gh:KhatmullinBulat/nuxt-launchpad', {
            dir: targetDir,
            force: true,
        })
    } catch (error) {
        cancel(`Failed to download launchpad: ${error}`)
        process.exit(1)
    }
    s.stop('Downloaded launchpad')

    const templates = Array.isArray(selectedTemplates) ? selectedTemplates as TemplateName[] : []
    for (const tpl of templates) {
        log.info(`${green('✨')} Applying template: ${blue(tpl)}`)
        await applyTemplate(targetDir, tpl)
    }

    const templatesDir = join(targetDir, 'templates')
    if (existsSync(templatesDir)) {
        rmSync(templatesDir, { recursive: true, force: true })
    }

    s.start(`${green('📦')} Installing dependencies...`)
    try {
        // bun по умолчанию
        await execa("bun", ["install"], {
            cwd: targetDir,
            stdio: "inherit"
        })
    } catch (error) {
        cancel(`Failed to install dependencies: ${error}`)
        process.exit(1)
    }
    s.stop('Installed dependencies')

    outro(
        `${green('✅')} Done! Now run:\n\n` +
        `${blue(`cd ${projectName}`)}\n` +
        `${blue("bun run dev")}\n`
    )
}

async function applyTemplate(projectDir: string, templateName: TemplateName) {
    const templateSrc = join(projectDir, 'templates', templateName)

    if (!existsSync(templateSrc)) {
        log.warn(yellow(`⚠️ Template "${templateName}" not found locally, skipping...`))
        return
    }

    const basePkg = join(projectDir, 'package.json')
    const tplPkg = join(templateSrc, 'package.json')
    if (existsSync(tplPkg)) {
        await mergePackageJson(basePkg, tplPkg)
    }

    await copyTemplateFiles(templateSrc, projectDir, ['package.json', 'nuxt.config.ts.patch', 'main.css'])

    const srcCss = join(templateSrc, 'main.css')
    if (existsSync(srcCss)) {
        const destCssDir = join(projectDir, 'app', 'shared', 'assets', 'css')
        mkdirSync(destCssDir, { recursive: true })
        const destCss = join(destCssDir, 'main.css')
        copyFileSync(srcCss, destCss)
    }

    const patchFile = join(templateSrc, 'nuxt.config.ts.patch')
    if (existsSync(patchFile)) {
        await patchNuxtConfig(join(projectDir, 'nuxt.config.ts'))
    }
}

async function mergePackageJson(basePath: string, extensionPath: string) {
    const base = JSON.parse(readFileSync(basePath, 'utf-8'))
    const ext = JSON.parse(readFileSync(extensionPath, 'utf-8'))

    const merged = {
        ...base,
        dependencies: { ...base.dependencies, ...ext.dependencies },
        devDependencies: { ...base.devDependencies, ...ext.devDependencies }
    }

    writeFileSync(basePath, JSON.stringify(merged, null, 2) + '\n')
}

async function copyTemplateFiles(src: string, dest: string, exclude: string[] = []) {
    const items = await import('node:fs/promises').then(m => m.readdir(src))

    for (const item of items) {
        if (exclude.includes(item)) continue

        const srcPath = join(src, item)
        const destPath = join(dest, item)
        const stat = await import('node:fs/promises').then(m => m.stat(srcPath))

        if (stat.isDirectory()) {
            mkdirSync(destPath, { recursive: true })
            await copyTemplateFiles(srcPath, destPath, exclude)
        } else {
            const destDir = dirname(destPath)
            mkdirSync(destDir, { recursive: true })
            copyFileSync(srcPath, destPath)
        }
    }
}

async function patchNuxtConfig(configPath: string) {
    const code = readFileSync(configPath, 'utf-8')
    const mod = parseModule(code)

    if (mod.imports.tailwindcss) {
        delete mod.imports.tailwindcss
    }
    mod.imports.$prepend({
        from: '@tailwindcss/vite',
        imported: 'default',
        local: 'tailwindcss',
    })

    const cfg = mod.exports.default.$args[0]

    if (!cfg.css) {
        cfg.css = []
    }

    const cssArray: [] = Array.isArray(cfg.css) ? cfg.css : []
    const cssPath = '~/app/shared/assets/css/main.css'
    const hasCss = cssArray.some((item: any) => item === cssPath || (item.$ast && item.$ast.value === cssPath))

    if (!hasCss) {
        cfg.css.push(cssPath)
    }

    if (!cfg.vite) {
        cfg.vite = {}
    }

    if (!cfg.vite.plugins) {
        cfg.vite.plugins = []
    }
    const plugins = cfg.vite.plugins

    const hasPlugin = plugins.some((p: any) => {
        return p && p.toString().includes('tailwindcss')
    })

    if (!hasPlugin) {
        plugins.push(builders.functionCall('tailwindcss'))
    }

    writeFileSync(configPath, mod.generate().code)
}

main().catch(console.error)
