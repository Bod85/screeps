const fs = require('fs')
let templatePath = ""

try {
  let fileContent = fs.readFileSync("template.json", "utf8")

  let templateJSON = JSON.parse(fileContent);
  if(!templateJSON.name)
    throw new UserException("Missing template name")
  let filename = templateJSON.name

  if(!templateJSON.buildings)
    throw new UserException("Missing buildings tag")

  let content = 'let blueprint = {}\n'
  for( let building in templateJSON.buildings) {
    switch(building) {
      case "road":
        content += 'blueprint[STRUCTURE_ROAD] = '
        break;
      case "nuker":
        content += 'blueprint[STRUCTURE_NUKER] = '
        break;
      case "observer":
        content += 'blueprint[STRUCTURE_OBSERVER] = '
        break;
      case "link":
        content += 'blueprint[STRUCTURE_LINK] = '
        break;
      case "constructedWall":
        content += 'blueprint[STRUCTURE_WALL] = '
        break;
      case "rampart":
        content += 'blueprint[STRUCTURE_RAMPART] = '
        break;
      case "tower":
        content += 'blueprint[STRUCTURE_TOWER] = '
        break;
      case "lab":
        content += 'blueprint[STRUCTURE_LAB] = '
        break;
      case "powerSpawn":
        content += 'blueprint[STRUCTURE_POWER_SPAWN] = '
        break;
      case "spawn":
        content += 'blueprint[STRUCTURE_SPAWN] = '
        break;
      case "storage":
        content += 'blueprint[STRUCTURE_STORAGE] = '
        break;
      case "extension":
        content += 'blueprint[STRUCTURE_EXTENSION] = '
        break;
      case "container":
        content += 'blueprint[STRUCTURE_CONTAINER] = '
        break;
      case "extractor":
        content += 'blueprint[STRUCTURE_EXTRACTOR] = '
        break;
      case "terminal":
          content += 'blueprint[STRUCTURE_TERMINAL] = '
          break;
    }

    content += '['
     templateJSON.buildings[building].pos.forEach(
       pos => {
      content += '[' + (pos.x - 25) + ',' + (pos.y - 25) + '], '
     });
    content += ']\n'
  }
  content += 'exports.BLUEPRINT = blueprint'
  
  fs.writeFileSync(__dirname + '/../ai/building/template/' + filename + '.js', content)
} catch(e) {
  console.log(e.message)
}
