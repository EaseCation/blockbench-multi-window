export const openInNewWindowAction = new Action('open_in_new_window', {
    icon: 'file_copy',
    name: '在另一窗口打开',
    description: '在另一窗口打开',
    category: 'file',
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

        Project.isSharing = true;
        // 通过IPC发送到主进程
        ipcRenderer.send('new-window', JSON.stringify(project_data));
    }
});