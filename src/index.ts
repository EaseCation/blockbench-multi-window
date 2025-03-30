import { registerPlugin } from './plugin';

declare global {
  interface ModelProject {
    isSharing?: boolean;
    isSharingClient?: boolean;
  }
}

// 立即执行函数包装
(function() {
  // 注册插件
  registerPlugin();
})();
