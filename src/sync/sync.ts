import { init as initProjectClose } from './sync-project-close';
import { init as initSyncFull } from './sync-full';
import { init as initSyncModel } from './sync-model';
import { init as initSyncTexture } from './sync-texture';
import { init as initSyncAnimation } from './sync-animation';

/**
 * 在这里init所有的Sync
 */
export function init() {
    initProjectClose();
    initSyncFull();
    initSyncModel();
    initSyncTexture();
    initSyncAnimation();
}