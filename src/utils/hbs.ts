import hbs from "handlebars"
import path from "path"
import { readFile } from "fs/promises"

export const compileTemplate = async (templatePath: string, data: Record<string, any>) => {
    const template = await readFile(path.resolve(__dirname, `../templates/${templatePath}`), { encoding: "utf-8" })

    return hbs.compile(template)(data)
}