import fs from 'fs';
import path from 'path';
import os from 'os';

export interface DriveConfig {
  paths: string[];
}

export class ConfigManager {
  private configDir: string;
  private configFile: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.config', 'drive');
    this.configFile = path.join(this.configDir, 'paths.json');
    this.ensureConfigExists();
  }

  private ensureConfigExists(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    if (!fs.existsSync(this.configFile)) {
      this.saveConfig({ paths: [] });
    }
  }

  private loadConfig(): DriveConfig {
    try {
      const data = fs.readFileSync(this.configFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { paths: [] };
    }
  }

  private saveConfig(config: DriveConfig): void {
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
  }

  public getPaths(): string[] {
    const config = this.loadConfig();
    // Filter out paths that no longer exist
    return config.paths.filter(p => fs.existsSync(p));
  }

  public addPath(newPath: string): boolean {
    const config = this.loadConfig();
    const absolutePath = path.resolve(newPath);

    // Check if path already exists
    if (config.paths.includes(absolutePath)) {
      return false;
    }

    // Check if path exists and is a directory
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
      throw new Error(`Path does not exist or is not a directory: ${absolutePath}`);
    }

    config.paths.push(absolutePath);
    this.saveConfig(config);
    return true;
  }

  public removePath(pathToRemove: string): boolean {
    const config = this.loadConfig();
    const absolutePath = path.resolve(pathToRemove);
    const initialLength = config.paths.length;

    config.paths = config.paths.filter(p => p !== absolutePath);

    if (config.paths.length < initialLength) {
      this.saveConfig(config);
      return true;
    }

    return false;
  }

  public clearInvalidPaths(): number {
    const config = this.loadConfig();
    const validPaths = config.paths.filter(p => fs.existsSync(p));
    const removedCount = config.paths.length - validPaths.length;

    if (removedCount > 0) {
      config.paths = validPaths;
      this.saveConfig(config);
    }

    return removedCount;
  }
}
