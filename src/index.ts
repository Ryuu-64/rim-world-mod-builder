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
        for (let projectConfigName of config.projectConfigNames) {
            const readBuildConfigPromise: Promise<ProjectBuildConfig> = fs.readJSON(
                "./src/config/" + projectConfigName,
                {
                    encoding: "utf8"
                }
            );
            const buildConfig = await readBuildConfigPromise;
            const buildPath = buildConfig.buildPath;
            //endregion

            //region remove build folder before build
            await fs.remove(buildPath);
            //endregion

            const promises: Promise<any>[] = [];
            if (buildConfig.hasAssemblies) {
                const copyAssembliesPromise: Promise<void> = fs.pathExists(
                    buildConfig.projectFolder + "1.4/Assemblies"
                ).then((isExist: boolean) => {
                    if (isExist) {
                        promises.push(
                            fs.copy(
                                buildConfig.projectFolder + "1.4/Assemblies",
                                buildPath + "/1.4/Assemblies"
                            )
                        );
                    }
                });
                await copyAssembliesPromise;
            }

            promises.push(
                fs.copy(
                    buildConfig.projectFolder + "1.4/Defs",
                    buildPath + "/1.4/Defs"
                ),
                fs.copy(
                    buildConfig.projectFolder + "1.4/Patches",
                    buildPath + "/1.4/Patches"
                ),
                fs.copy(
                    buildConfig.projectFolder + "About",
                    buildPath + "/About"
                ),
                fs.copy(
                    buildConfig.projectFolder + "Languages",
                    buildPath + "/Languages"
                )
            );
            await Promise.all(promises);
            console.log(`Build completed successfully, project config name="${projectConfigName}".`);
        }
    } catch (err) {
        console.error('An error occurred during build:', err);
    }
}

class ProjectNameConfig {
    projectConfigNames: string[];

    constructor(projectConfigNames: string[]) {
        this.projectConfigNames = projectConfigNames;
    }
}

class ProjectBuildConfig {
    hasAssemblies: boolean;
    projectName: string;
    projectFolder: string;
    buildPath: string;

    constructor(hasAssemblies: boolean, projectName: string, projectFolder: string, buildPath: string) {
        this.hasAssemblies = hasAssemblies;
        this.projectName = projectName;
        this.projectFolder = projectFolder;
        this.buildPath = buildPath;
    }
}