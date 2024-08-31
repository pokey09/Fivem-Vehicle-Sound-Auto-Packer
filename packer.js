const fs = require("fs");
const path = require("path");

const srcDir = path.join(".", "uncompiled");
const destDir = path.join(".", "compiled");
const requiredFiles = ["audioconfig", "sfx"];

let manifestContent = `
fx_version 'cerulean'

game 'gta5'

files {
  'audioconfig/*.dat151.rel',
  'audioconfig/*.dat54.rel',
  'sfx/**/*.awc'
}
`;

if (!fs.existsSync(destDir) || fs.readdirSync(destDir).length === 0) {
  fs.readdir(srcDir, (err, folders) => {
    if (err) {
      console.error("Error reading source directory:", err);
      return;
    }

    folders.forEach((folder) => {
      let hasAllRequiredFiles = requiredFiles.every((file) =>
        fs.existsSync(path.join(srcDir, folder, file))
      );

      if (hasAllRequiredFiles) {
        let srcStreamDir = path.join(srcDir, folder, "audioconfig");
        let destStreamDir = path.join(destDir, "audioconfig");
        fs.mkdirSync(destStreamDir, { recursive: true });
        copyFiles(srcStreamDir, destStreamDir);

        let srcDataDir = path.join(srcDir, folder, "sfx", `dlc_${folder}`);
        let destDataDir = path.join(destDir, "sfx", `dlc_${folder}`);
        fs.mkdirSync(destDataDir, { recursive: true });
        copyAWCFiles(srcDataDir, destDataDir);

        manifestContent += `
data_file 'AUDIO_GAMEDATA' 'audioconfig/${folder}_game.dat'
data_file 'AUDIO_SOUNDDATA' 'audioconfig/${folder}_sounds.dat'
data_file 'AUDIO_WAVEPACK' 'sfx/dlc_${folder}'
`;
      }
    });

    let destManifest = path.join(destDir, "fxmanifest.lua");

    try {
      fs.writeFileSync(destManifest, manifestContent, "utf8");
    } catch (err) {
      console.error("Error writing file:", err);
    }

    console.log("Process completed successfully.");
  });
} else {
  console.log(`The 'compiled' directory is not empty.`);
}

function copyFile(src, dest) {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      console.log(`File does not exist: ${src}, skipping copy.`);
    }
  } catch (err) {
    console.error("Error copying file:", err);
  }
}

function copyFiles(srcDir, destDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      let srcFile = path.join(srcDir, file);
      let destFile = path.join(destDir, file);
      copyFile(srcFile, destFile);
    });
  });
}

function copyAWCFiles(srcDir, destDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files
      .filter((file) => path.extname(file) === ".awc")
      .forEach((file) => {
        let srcFile = path.join(srcDir, file);
        let destFile = path.join(destDir, file);
        copyFile(srcFile, destFile);
      });
  });
}
