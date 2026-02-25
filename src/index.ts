#!/usr/bin/env node
import { cancel, intro, isCancel, outro, text } from "@clack/prompts";
import { execa } from "execa";
import { downloadTemplate } from "giget";
import { blue, green } from "kolorist";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

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

    const targetDir = path.join(process.cwd(), projectName)

    if (existsSync(targetDir)) {
        console.log(`⚠️  Directory ${projectName} already exists. Cleaning...`)
        rmSync(targetDir, { recursive: true, force: true })
    }

    console.log(`${green('⬇️')} Downloading template...`)

    try {
        await downloadTemplate('gh:KhatmullinBulat/nuxt-launchpad', {
            dir: targetDir,
            force: true,
        })
    } catch (error) {
        cancel(`Failed to download template: ${error}`)
        process.exit(1)
    }

    console.log(`${green('📦')} Installing dependencies...`)

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

    outro(
        `${green('✅')} Done! Now run:\n\n` +
        `${blue(`cd ${projectName}`)}\n` +
        `${blue("bun run dev")}\n`
    )
}

main().catch(console.error)