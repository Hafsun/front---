<template>
  <div class="welcome-header">
      <!-- 左侧欢迎提示词 -->
      <div class="welcome-message">
          <span class="welcome-text">欢迎</span>
          <span class="user-name">{{ userInfo.username }}</span>
          <span class="welcome-text">，您目前已经面试</span>
          <span class="highlight">{{ userInfo.interviewCount }}</span>
          <span class="welcome-text">次，综合评分</span>
          <span class="highlight">{{ userInfo.comprehensiveScore }}</span>
          <span class="welcome-text">分，继续加油！</span>
      </div>

      <!-- 右侧用户信息和操作 -->
      <div class="user-profile">
          <div ref="userInfoRef" class="user-info" @click="toggleDropdown" @mouseenter="hovering = true" @mouseleave="hovering = false"
              :class="{ 'hover-active': hovering }">
              <img :src="userInfo.pictureUrl" @error="handleImageError" alt="用户头像" class="avatar">
              <span class="username">{{ userInfo.username }}</span>
              <!-- 使用Element Plus官方下拉箭头 -->
              <svg class="arrow-icon" viewBox="0 0 1024 1024" width="14" height="14">
                  <path d="M831.872 340.864L512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a30.592 30.592 0 0 0 42.752 0l340.288-331.712a29.12 29.12 0 0 0 0-41.6 30.592 30.592 0 0 0-40.832 0z" fill="currentColor"></path>
              </svg>
          </div>

          <!-- 使用 Teleport 将下拉菜单渲染到 body，完全脱离当前层叠上下文 -->
          <Teleport to="body">
              <div v-if="isRendered" class="dropdown-menu-teleport" :style="dropdownStyle" @click.stop>
                  <div class="menu-content" :class="{ 'menu-enter': dropdownVisible, 'menu-leave': !dropdownVisible }">
                      <div class="menu-header">
                          <div class="avatar-container" @click="showAvatarPreview = true">
                              <!-- 这里直接使用 userInfo.pictureUrl，因为 store 已经处理了默认值 -->
                              <img :src="userInfo.pictureUrl" @error="handleImageError" alt="放大的头像" class="menu-avatar">
                          </div>
                          <div class="user-text">
                              <div class="menu-username">{{ userInfo.username }}</div>
                              <div class="menu-user-email">{{ userInfo.email }}</div>
                          </div>
                      </div>
                      <div class="menu-divider"></div>

                      <!-- 基础信息菜单项 -->
                      <div class="menu-item" @click="handleCommand('profile-basic')">
                          <svg class="menu-icon" viewBox="0 0 1024 1024" width="14" height="14">
                              <path d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512z" fill="currentColor"></path>
                              <path d="M999.424 755.2a6.4 6.4 0 0 0-3.776-9.216 578.56 578.56 0 0 0-991.296 0 6.4 6.4 0 0 0-3.776 9.216A416 416 0 0 0 512 896a416 416 0 0 0 487.424-140.8z" fill="currentColor"></path>
                          </svg>
                          <span>基础信息</span>
                      </div>

                      <!-- 面试信息菜单项 -->
                      <div class="menu-item" @click="handleCommand('profile-interviews')">
                          <svg class="menu-icon" viewBox="0 0 1024 1024" width="14" height="14">
                              <path d="M384 128v64H192a64 64 0 0 0-64 64v512a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H640v-64a64 64 0 0 0-64-64H448a64 64 0 0 0-64 64z" fill="currentColor"></path>
                          </svg>
                          <span>面试信息</span>
                      </div>

                      <div class="menu-item" @click="handleCommand('changePassword')">
                          <svg class="menu-icon" viewBox="0 0 1024 1024" width="14" height="14">
                              <path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v512a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H640v-64a64 64 0 0 0-64-64H448a64 64 0 0 0-64 64z" fill="currentColor"></path>
                          </svg>
                          <span>更改密码</span>
                      </div>

                      <div class="menu-item" @click="handleCommand('security')">
                          <svg class="menu-icon" viewBox="0 0 1024 1024" width="14" height="14">
                              <path d="M866.9 169.9L527.1 54.1C523 52.7 517.5 52 512 52s-11 .7-15.1 2.1L157.1 169.9c-8.3 2.8-15.1 12.4-15.1 21.2v482.4c0 8.8 5.7 20.4 12.6 25.9L499.3 968c3.5 2.7 8 4.1 12.6 4.1s9.2-1.4 12.6-4.1l344.7-268.6c6.9-5.4 12.6-17 12.6-25.9V191.1c.2-8.8-6.6-18.3-14.9-21.2z" fill="currentColor"></path>
                          </svg>
                          <span>更改密保</span>
                      </div>

                      <div class="menu-divider"></div>

                      <div class="menu-item logout" @click="handleCommand('logout')">
                          <svg class="menu-icon" viewBox="0 0 1024 1024" width="14" height="14">
                              <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9 353.28 353.28 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 192.2 0 323.6-116.2 361.3-279.7 3.4-5.3-.4-12.3-6.7-12.3z" fill="currentColor"></path>
                              <path d="m904 476H588c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h316c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" fill="currentColor"></path>
                          </svg>
                          <span>退出登录</span>
                      </div>
                  </div>
              </div>
          </Teleport>
      </div>

      <!-- 头像预览弹窗 -->
      <Teleport to="body">
          <div v-if="showAvatarPreview" class="avatar-preview-mask" @click="showAvatarPreview = false">
              <div class="preview-content" @click.stop>
                  <img :src="userInfo.pictureUrl" @error="handleImageError" alt="放大的头像" class="preview-img">
              </div>
          </div>
      </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 直接使用 userStore 的 welcomeInfo getter
const userInfo = computed(() => userStore.welcomeInfo);

const dropdownVisible = ref(false);
const isRendered = ref(false);
const hovering = ref(false);
const showAvatarPreview = ref(false);
const userInfoRef = ref(null);
const dropdownStyle = ref({});

const calculateDropdownPosition = () => {
    if (userInfoRef.value) {
        const rect = userInfoRef.value.getBoundingClientRect();
        dropdownStyle.value = {
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            right: `${window.innerWidth - rect.right}px`,
            width: '200px',
            zIndex: '2147483647'
        };
    }
};

// 切换下拉菜单
const toggleDropdown = () => {
    if (!dropdownVisible.value) {
        isRendered.value = true;
        nextTick(() => {
            calculateDropdownPosition();
            setTimeout(() => {
                dropdownVisible.value = true;
            }, 10);
        });
    } else {
        dropdownVisible.value = false;
        setTimeout(() => {
            isRendered.value = false;
        }, 300);
    }
};

// 处理菜单命令
const handleCommand = (command) => {
    dropdownVisible.value = false;
    setTimeout(() => {
        isRendered.value = false;
        switch (command) {
            case 'profile-basic':
                router.push('/home/personal-info/basic');
                break;
            case 'profile-interviews':
                router.push('/home/personal-info/interviews');
                break;
            case 'changePassword':
                router.push('/home/account/change-password');
                break;
            case 'security':
                router.push('/home/account/change-security');
                break;
            case 'logout':
                userStore.logout();
                router.push('/login');
                break;
        }
    }, 300);
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
    if (dropdownVisible.value) {
        const userProfile = document.querySelector('.user-profile');
        if (userProfile && !userProfile.contains(event.target)) {
            dropdownVisible.value = false;
            setTimeout(() => {
                isRendered.value = false;
            }, 300);
        }
    }
};

// 监听ESC键
const handleEscKey = (event) => {
    if (event.key === 'Escape' && showAvatarPreview.value) {
        showAvatarPreview.value = false;
    }
};

// 图片加载失败处理函数
const handleImageError = (event) => {
  // 当图片加载失败时，回退到一个通用的在线头像服务
  // 这里使用 ui-avatars.com，它会根据用户名生成一个头像
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.value.username || '访客')}&size=50&background=409eff&color=fff`;
};

onMounted(() => {
    // 在组件挂载时尝试获取用户信息，确保数据是最新的
    userStore.fetchUserInfo();
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscKey);
});
</script>

<style scoped lang="scss">
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  flex-grow: 1;
  padding: 4px 12px;
  margin: 4px 0px;
  border-radius: 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 50%, 
    rgba(241, 245, 249, 0.85) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible; // 改为 visible 确保下拉菜单不被裁剪
  user-select: none;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(99, 102, 241, 0.3) 20%, 
      rgba(139, 92, 246, 0.3) 50%, 
      rgba(236, 72, 153, 0.3) 80%, 
      transparent 100%);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(99, 102, 241, 0.2);
  }
}

.welcome-message {
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.user-name {
  font-weight: 700;
  margin: 0 6px;
  color: #0f172a;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.highlight {
  color: #3b82f6;
  font-weight: 700;
  margin: 0 6px;
  padding: 2px 6px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 999999999;
  margin-left: auto;
  margin-right: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 252, 0.8) 100%);
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 999999999;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.username {
  font-size: 14px;
  font-weight: 600;
  margin-right: 8px;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.arrow-icon {
  margin-left: 4px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

.dropdown-menu-teleport {
  position: fixed !important;
  z-index: 2147483647 !important;
  margin-top: 0;
  overflow: visible;
  border-radius: 12px;
  pointer-events: auto;
}

.menu-content {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25) ,
    0 12px 24px rgba(0, 0, 0, 0.15) ,
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.3s ease-out;
  pointer-events: auto;
  position: relative;
  z-index: 2147483647 !important;

  &.menu-enter {
    opacity: 1;
    transform: translateY(0);
    max-height: 400px;
  }

  &.menu-leave {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
}

.menu-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  height: 56px;
  line-height: 1;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.8) 0%, 
    rgba(241, 245, 249, 0.6) 100%);
  border-radius: 12px 12px 0 0;
}

.avatar-container {
  cursor: pointer;
  margin-right: 12px;
  border-radius: 50%;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.menu-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-text {
  cursor: default;
}

.menu-username {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.menu-user-email {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(226, 232, 240, 0.8) 50%, 
    transparent 100%);
  margin: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  border-radius: 6px;
  margin: 2px 8px;

  &:hover {
    background: linear-gradient(135deg, 
      rgba(239, 246, 255, 0.8) 0%, 
      rgba(219, 234, 254, 0.6) 100%);
    color: #1e293b;
    transform: translateX(2px);
  }

  &.logout {
    color: #ef4444;
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(254, 242, 242, 0.8) 0%, 
        rgba(254, 226, 226, 0.6) 100%);
      color: #dc2626;
    }
  }
}

.menu-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  margin-right: 12px;
}

.avatar-preview-mask {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647 !important; // 确保头像预览也在最上层
  opacity: 0;
  animation: fadeIn 300ms ease forwards;
  backdrop-filter: blur(8px);
}

.preview-content {
  padding: 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

.preview-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.user-info.hover-active {
  background: linear-gradient(135deg, 
    rgba(239, 246, 255, 0.9) 0%, 
    rgba(219, 234, 254, 0.8) 100%);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 
    0 4px 16px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);

  .arrow-icon {
    transform: rotate(180deg);
    color: #6366f1;
  }
}
</style>
