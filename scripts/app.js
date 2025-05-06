/**
 * 成绩分析系统 - 主应用脚本
 * 负责页面导航和全局初始化
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();
    
    // 设置当前日期为默认日期
    if (document.getElementById('dataDate')) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataDate').value = today;
    }
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    // 为每个导航链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标区域ID
            const targetSectionId = this.getAttribute('data-section');
            
            // 移除所有导航链接的active类
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // 为当前点击的链接添加active类
            this.classList.add('active');
            
            // 隐藏所有section
            const sections = document.querySelectorAll('section.section');
            sections.forEach(section => section.classList.remove('active'));
            
            // 显示目标section
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 如果导航到数据分析页面，确保文件数据已加载
                if (targetSectionId === 'analysis-section') {
                    // 确保分析模块中的文件数据加载函数已定义
                    if (typeof loadAllFiles === 'function') {
                        console.log('导航到数据分析页面，确保加载文件数据');
                        loadAllFiles();
                        
                        // 如果存在分析类型选择，初始化它
                        const analysisTypeSelect = document.getElementById('analysisTypeSelect');
                        if (analysisTypeSelect && analysisTypeSelect.value) {
                            // 触发change事件，以显示正确的分析选项
                            const event = new Event('change');
                            analysisTypeSelect.dispatchEvent(event);
                        }
                    }
                }
            }
        });
    });
}

/**
 * 显示信息提示
 * @param {string} message - 要显示的消息
 * @param {string} type - 消息类型 (success, error, info)
 * @param {number} duration - 显示持续时间(毫秒)
 */
function showMessage(message, type = 'info', duration = 3000) {
    // 检查是否已存在消息容器
    let messageContainer = document.querySelector('.message-container');
    
    // 如果不存在，创建一个
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
    }
    
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // 添加到容器中
    messageContainer.appendChild(messageElement);
    
    // 添加动画样式
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 10);
    
    // 设置自动消失
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-20px)';
        
        // 移除元素
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
            
            // 如果没有更多消息，移除容器
            if (messageContainer.children.length === 0) {
                document.body.removeChild(messageContainer);
            }
        }, 300);
    }, duration);
}

// 添加消息容器样式
document.head.insertAdjacentHTML('beforeend', `
<style>
.message-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message {
    min-width: 250px;
    padding: 12px 16px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
}

.message-success {
    border-left: 4px solid #28a745;
}

.message-error {
    border-left: 4px solid #dc3545;
}

.message-info {
    border-left: 4px solid #4a6cf7;
}
</style>
`);

// 确保XLSX库在全局可用
window.addEventListener('DOMContentLoaded', function() {
    console.log('成绩分析系统初始化...');
    
    // 检查并确保XLSX库可用
    if (typeof XLSX === 'undefined') {
        console.warn('XLSX库尚未加载，系统部分功能可能无法正常工作');
    } else {
        console.log('XLSX库已加载');
    }
}); 