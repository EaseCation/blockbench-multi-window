import { listenIPCMagic, sendIPCMagic } from "../ipc/ipc-magic";

const modelEvents = [
    'update_selection'
];

export function init() {
    // 监听model相关事件
    modelEvents.forEach(eventName => {
        Blockbench.on(eventName, () => {
            if (Project && Project.isSharing) {
                console.log("[SharedProject] 发送模型数据...", eventName);
                syncModelData();
            }
        });
    });

    // 监听来自其他窗口的模型数据
    listenIPCMagic('sync-model-data', (data) => {
        if (!Project) return;
        if (Project.name === data.name && data['source_uuid'] !== Project.uuid) {
            console.log(`[SharedProject] 收到来自其他窗口的模型数据更新...`, data);
            refreshModel(data);
        }
    });
}

function syncModelData() {
    if (!Project || !Project.isSharing) return;
    
    let project_data = Codecs.project.compile({
        editor_state: false,
        history: false, // 不需要复制历史记录
        uuids: true,
        bitmaps: false,
        raw: true
    });
    project_data['source_uuid'] = Project.uuid;
    delete project_data['editor_state'];
    delete project_data['textures'];
    
    // 通过IPC发送到主进程
    sendIPCMagic('sync-model-data', project_data);
}

function refreshModel(model: any) {
    if (!Project) return;
    // 保存当前项目状态的重要部分
    const currentUUID = Project.uuid;
    const currentName = Project.name;

    // 清除当前模型数据，但保留项目结构
    Blockbench.dispatchEvent('pre_refresh_project');
    Mesh.all.forEach(mesh => {
        mesh.remove();
    });
    Mesh.all = [];
    Group.all.forEach(group => {
        group.remove(false);
    });
    Group.all = [];
    Blockbench.Animation.all.forEach(animation => {
        animation.remove(false, true);
    });
    Blockbench.Animation.all = [];

    //@ts-ignore
    Codecs.project.parse(model, model.editor_state?.save_path || '', true);

    // 恢复项目属性
    Project.uuid = currentUUID;
    Project.name = currentName;

    // 更新界面
    Canvas.updateAll();
    Blockbench.dispatchEvent('post_refresh_project');
}
