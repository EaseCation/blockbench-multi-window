import { openNewWindow as ipcOpenNewWindow } from "../ipc/ipc-window";

export const openInNewWindowAction = new Action('open_in_new_window', {
    icon: 'backup_table',
    category: 'file',
    name: tl('action.open_in_new_window'),
    description: tl('action.open_in_new_window.desc'),
    condition: () => isApp && !!Project, // 只有在有项目打开且在应用程序中时才可用
    click: function () {
        if (!Project) return;
        // 编译当前项目，保留UUID以便共享内存
        let project_data = Codecs.project.compile({
            editor_state: true,
            history: false, // 不需要复制历史记录
            uuids: true,
            bitmaps: true,
            raw: true
        });
        project_data.splitMode = true;
        Project.isSharing = true;
        // 通过IPC发送到主进程
        ipcOpenNewWindow(project_data);
    }
});