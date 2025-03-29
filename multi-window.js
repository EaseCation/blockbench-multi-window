Plugin.register('multi-window', {
    name: 'Multi Window',
    author: 'EaseCation',
    description: '为BlockBench实现多窗口同步',
    version: '1.0.0',
    variant: 'desktop',
    onload() {
        // MenuBar
        const action = new Action('open_in_new_window', {
            icon: 'file_copy',
            name: '在另一窗口打开',
            description: '在另一窗口打开',
            category: 'file',
            condition: () => isApp && Project, // 只有在有项目打开且在应用程序中时才可用
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
        MenuBar.addAction(action, 'file.8');

        // ==== 发送处理 ====

        // 基础同步
        const syncEvents = [
            'update_selection',
            'add_cube', 'add_mesh', 'add_group', 'update_texture', 'add_texture_mesh',
            'update_keyframe', 'group_elements',
            'finish_edit', 'undo', 'redo', 'change_color',
            'update_project_settings', 'update_project_resolution', 'add_texture',
            'remove_animation', 'edit_animation_properties', 'change_texture_path',
            'load_undo_save', 'merge_project'
        ];

        syncEvents.forEach(eventName => {
            Blockbench.on(eventName, () => {
                if (Project && Project.isSharing) {
                    // console.log("[SharedProject] 发送数据...", eventName);
                    syncSharedData();
                }
            });
        });

        Blockbench.on('display_animation_frame', () => {
            const currentAnimation = Animation.selected;
            if (isApp && Project.isSharing && currentAnimation) {
                if (!Timeline.playing) {
                    const data = {
                        __magic__: 'sync-animation-frame',
                        project_name: Project.name,
                        animation_name: currentAnimation.name,
                        time: Timeline.time
                    }
                    // 通过IPC发送到主进程
                    ipcRenderer.send('dragging-tab', JSON.stringify(data));
                }
            }
        });

        const timelineEvents = [
            'timeline_play', 'timeline_pause'
        ];
        timelineEvents.forEach(eventName => {
            Blockbench.on(eventName, () => {
                const currentAnimation = Animation.selected;
                if (isApp && Project.isSharing && currentAnimation) {
                    const data = {
                        __magic__: 'sync-animation-timeline',
                        project_name: Project.name,
                        animation_name: currentAnimation.name,
                        animations: Animation.all.map(animation => ({
                            name: animation.name,
                            playing: animation.playing,
                            time: animation.time
                        })),
                        playing: Timeline.playing,
                        time: Timeline.time
                    }
                    // 通过IPC发送到主进程
                    ipcRenderer.send('dragging-tab', JSON.stringify(data));
                }
            });
        });

        // 同步共享数据的方法
        function syncSharedData() {
            if (isApp) {
                let project_data = Codecs.project.compile({
                    editor_state: true,
                    history: false, // 不需要复制历史记录
                    uuids: true,
                    bitmaps: true,
                    raw: true
                });
                project_data['__magic__'] = 'sync-shared-data';
                project_data['source_uuid'] = Project.uuid;
                delete project_data['editor_state'];
                // 通过IPC发送到主进程
                ipcRenderer.send('dragging-tab', JSON.stringify(project_data));
            }
        }

        // ==== 接收处理 ====

        // 究极黑魔法！
        setTimeout(() => {
            ipcRenderer.removeAllListeners('accept-detached-tab');
            ipcRenderer.on('accept-detached-tab', (event, data) => {
                if (data['__magic__'] === 'sync-shared-data') {
                    // magic，同步数据
                    if (!Project) return;
                    if (Project.name === data.name && data['source_uuid'] !== Project.uuid) {
                        // console.log(`[SharedProject] 收到来自其他窗口的模型数据更新...`, data);
                        refreshCurrentProject(data);
                    }
                } else if (data['__magic__'] === 'sync-animation-frame') {
                    // 是magic，同步动画
                    if (!Project) return;
                    if (Project.name === data.project_name) {
                        // console.log(`[SharedProject] 收到来自其他窗口的动画数据更新...`, data);
                        if (Animation.selected && Animation.selected.name === data.animation_name && !Timeline.playing) {
                            Timeline.setTime(data.time);
                            Timeline.pause();
                        }
                    }
                } else if (data['__magic__'] === 'sync-animation-timeline') {
                    // 是magic，同步时间轴
                    if (!Project) return;
                    if (Project.name === data.project_name) {
                        // console.log(`[SharedProject] 收到来自其他窗口的时间轴数据更新...`, data);
                        data.animations.forEach(animationData => {
                            const animation = Animation.all.find(anim => anim.name === animationData.name);
                            if (animation) {
                                animation.playing = animationData.playing;
                                animation.time = animationData.time;
                            }
                            if (data.animation_name === animationData.name) {
                                animation.select();
                            }
                        });
                        if (data.playing) {
                            Timeline.setTime(data.time);
                            Timeline.start();
                        } else {
                            Timeline.setTime(data.time);
                            Timeline.pause();
                        }
                    }
                } else {
                    // 执行原版逻辑
                    Interface.page_wrapper.classList.toggle('accept_detached_tab', data);
                }
            });
        }, 500);

        function refreshCurrentProject(model) {
            // 保存当前项目状态的重要部分
            const currentUUID = Project.uuid;
            const currentName = Project.name;
            const currentSelection = {
                elements: Project.selected_elements.slice(),
                groups: Project.selected_groups.slice()
            };

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
            Texture.all.forEach(texture => {
                texture.remove(false);
            });
            Texture.all = [];
            Animation.all.forEach(animation => {
                animation.remove(false, true);
            });
            Animation.all = [];
            AnimationController.all.forEach(controller => {
                controller.remove(false);
            });
            AnimationController.all = [];
            Codecs.project.parse(model, model.editor_state?.save_path || '', true);

            // 恢复项目属性
            Project.uuid = currentUUID;
            Project.name = currentName;

            // 尝试恢复选择（如果元素UUID匹配）
            if (currentSelection.elements.length) {
                Project.selected_elements = Outliner.elements.filter(element =>
                    currentSelection.elements.find(sel => sel.uuid === element.uuid)
                );
            }

            // 尝试更新当前动画选择
            if (model.animations) {
                const selectedAnimation = model.animations.find(animation => animation.selected);
                if (selectedAnimation) {
                    Animation.all.find(animation => animation.name === selectedAnimation.name)?.select();
                }
            }

            // 更新界面
            Canvas.updateAll();
            Blockbench.dispatchEvent('post_refresh_project');
        }
    }
});