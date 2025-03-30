import { listenIPC, sendIPC } from "../ipc/ipc-helper";

export function init() {
    // 监听动画帧变化
    Blockbench.on('display_animation_frame', () => {
        const currentAnimation = Blockbench.Animation.selected;
        if (Project && Project.isSharing && currentAnimation) {
            if (!Timeline.playing) {
                const data = {
                    project_name: Project.name,
                    animation_name: currentAnimation.name,
                    time: Timeline.time
                };
                // 通过IPC发送到主进程
                sendIPC('sync-animation-frame', data);
            }
        }
    });

    // 监听时间轴事件
    const timelineEvents = [
        'timeline_play', 'timeline_pause'
    ];
    timelineEvents.forEach(eventName => {
        Blockbench.on(eventName, () => {
            const currentAnimation = Blockbench.Animation.selected;
            if (Project && Project.isSharing && currentAnimation) {
                const data = {
                    project_name: Project.name,
                    animation_name: currentAnimation.name,
                    animations: Blockbench.Animation.all.map(animation => ({
                        name: animation.name,
                        playing: animation.playing,
                        time: animation.time
                    })),
                    playing: Timeline.playing,
                    time: Timeline.time
                };
                // 通过IPC发送到主进程
                sendIPC('sync-animation-timeline', data);
            }
        });
    });

    // 监听来自其他窗口的动画帧数据
    listenIPC('sync-animation-frame', (data) => {
        if (!Project) return;
        if (Project.name === data.project_name) {
            // console.log(`[SharedProject] 收到来自其他窗口的动画数据更新...`, data);
            if (Blockbench.Animation.selected && Blockbench.Animation.selected.name === data.animation_name && !Timeline.playing) {
                Timeline.setTime(data.time);
                Timeline.pause();
            }
        }
    });

    // 监听来自其他窗口的时间轴数据
    listenIPC('sync-animation-timeline', (data) => {
        if (!Project) return;
        if (Project.name === data.project_name) {
            // console.log(`[SharedProject] 收到来自其他窗口的时间轴数据更新...`, data);
            data.animations.forEach((animationData: any) => {
                const animation = Blockbench.Animation.all.find(anim => anim.name === animationData.name);
                if (data.animation_name === animationData.name) {
                    animation?.select();
                }
                if (animation) {
                    animation.playing = animationData.playing;
                    //animation.time = animationData.time;
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
    });
}
