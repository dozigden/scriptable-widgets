// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: utensils;

// note, app deep linking urls in format:
// homeassistant://navigate/calendar

let widget = await createWidget();
if (!config.runsInWidget) {
    await widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();

async function createWidget(items) {
    const showLabels = false;

    let fileManager = FileManager.iCloud();
    let configPath = fileManager.joinPath(fileManager.documentsDirectory(), "haconfig.json");
    let exists = fileManager.fileExists(configPath);
    console.log('Config file exists', exists);
    let configString = fileManager.readString(configPath);
    let config = JSON.parse(configString);

    let req = new Request(`${config.haUrl}/api/states`)
    req.headers = {"Authorization": `Bearer ${config.token}`, "content-type": "application/json" }
    let haState = await req.loadJSON();

    const entityIds = ['sensor.mealie_breakfast_today', 'sensor.mealie_lunch_today', 'sensor.mealie_dinner_today', 'sensor.mealie_side_today'];

    /* Create the widget */
    const widget = new ListWidget();
    widget.backgroundColor = new Color("#03a9f4", 1.0);

    const mainStack = widget.addStack();
    mainStack.layoutVertically();

    let entities = haState.filter((entity) => entityIds.findIndex((entityId) => entityId == entity.entity_id ) >= 0);

    entities.filter((entity) => entity.state != 0).forEach(entity => {
        let displayName = entity.attributes?.friendly_name ?? entity;
        let state = entity.state;
        let units = entity.attributes?.unit_of_measurement ?? '';

        let entityStack = mainStack.addStack()
        
        if (showLabels) {
            let text = entityStack.addText(`${displayName}:`);
            text.font = Font.mediumMonospacedSystemFont(14);
            text.textColor = Color.black();
            text.textOpacity = 0.8;
            text.leftAlignText();
            
            entityStack.addSpacer();
        }

        let displayState = isNaN(state) ? state : Math.round(state); 
        text = entityStack.addText(`${displayState}`);
        text.font = Font.mediumMonospacedSystemFont(14);
        text.textColor = Color.white();
        text.textOpacity = 1;
        text.rightAlignText();


        text = entityStack.addText(`${units}`);
        text.font = Font.mediumMonospacedSystemFont(10);
        text.textColor = Color.white();
        text.textOpacity = 0.6;
        text.rightAlignText();
    });
    return widget;
}
