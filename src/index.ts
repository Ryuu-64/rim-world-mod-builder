import * as fs from 'fs-extra';

buildProject();

async function buildProject(): Promise<void> {
    try {
        //region read config
        const readNameConfigPromise: Promise<ProjectNameConfig> = fs.readJSON(
            "./src/config/projectNameConfig.json",
            {
                encoding: "utf8"
            }
        );
        const config: ProjectNameConfig = await readNameConfigPromise;
        const readBuildConfigPromise: Promise<ProjectBuildConfig> = fs.readJSON(
            "./src/config/" + config.projectConfigName,
            {
                encoding: "utf8"
            }
        );
        const projectConfig = await readBuildConfigPromise;
        //endregion

        const buildFolder = "./build/" + projectConfig.projectName;

        //region remove build folder before build
        await fs.remove(buildFolder);
        //endregion

        const promises: Promise<any>[] = [];
        if (projectConfig.hasAssemblies) {
            const copyAssembliesPromise: Promise<void> = fs.pathExists(
                projectConfig.projectFolder + "1.4/Assemblies"
            ).then((isExist: boolean) => {
                if (isExist) {
                    promises.push(
                        fs.copy(
                            projectConfig.projectFolder + "1.4/Assemblies",
                            buildFolder + "/1.4/Assemblies"
                        )
                    );
                }
            });
            await copyAssembliesPromise;
        }

        promises.push(
            fs.copy(
                projectConfig.projectFolder + "1.4/Defs",
                buildFolder + "/1.4/Defs"
            ),
            fs.copy(
                projectConfig.projectFolder + "1.4/Patches",
                buildFolder + "/1.4/Patches"
            ),
            fs.copy(
                projectConfig.projectFolder + "About",
                buildFolder + "/About"
            ),
            fs.copy(
                projectConfig.projectFolder + "Languages",
                buildFolder + "/Languages"
            )
        );
        await Promise.all(promises);
        console.log("Build completed successfully.");
    } catch (err) {
        console.error('An error occurred during build:', err);
    }
}

class ProjectNameConfig {
    projectConfigName: string;

    constructor(projectConfigName: string) {
        this.projectConfigName = projectConfigName;
    }
}

class ProjectBuildConfig {
    hasAssemblies: boolean;
    projectName: string;
    projectFolder: string;

    constructor(hasAssemblies: boolean, projectName: string, projectFolder: string) {
        this.hasAssemblies = hasAssemblies;
        this.projectName = projectName;
        this.projectFolder = projectFolder;
    }
}