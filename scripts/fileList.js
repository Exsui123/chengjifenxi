/**
 * 成绩分析系统 - 文件列表模块脚本
 * 负责展示和管理已上传的文件
 */

// 默认分数线设置
const DEFAULT_THRESHOLDS = {
    passScore: 60,      // 及格线
    goodScore: 75,      // 良好线
    excellentScore: 90  // 优秀线
};

// 当前分数线设置
let currentThresholds = {...DEFAULT_THRESHOLDS};

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    initFileListModule();
    initScoreThresholds();
});

/**
 * 初始化分数线设置功能
 */
function initScoreThresholds() {
    // 获取分数线相关DOM元素
    const passScoreInput = document.getElementById('passScore');
    const goodScoreInput = document.getElementById('goodScore');
    const excellentScoreInput = document.getElementById('excellentScore');
    const saveThresholdsBtn = document.getElementById('saveThresholdsBtn');
    const resetThresholdsBtn = document.getElementById('resetThresholdsBtn');
    
    // 如果元素不存在，表示不在文件列表页面，直接返回
    if (!passScoreInput || !goodScoreInput || !excellentScoreInput || !saveThresholdsBtn) return;
    
    // 从本地存储加载分数线设置
    loadThresholdsFromStorage();
    
    // 设置输入框的初始值
    passScoreInput.value = currentThresholds.passScore;
    goodScoreInput.value = currentThresholds.goodScore;
    excellentScoreInput.value = currentThresholds.excellentScore;
    
    // 为保存按钮添加点击事件
    saveThresholdsBtn.addEventListener('click', saveThresholds);
    
    // 为重置按钮添加点击事件
    if (resetThresholdsBtn) {
        resetThresholdsBtn.addEventListener('click', function() {
            // 重置为默认值
            currentThresholds = {...DEFAULT_THRESHOLDS};
            
            // 更新输入框的值
            passScoreInput.value = currentThresholds.passScore;
            goodScoreInput.value = currentThresholds.goodScore;
            excellentScoreInput.value = currentThresholds.excellentScore;
            
            // 保存到本地存储
            saveThresholdsToStorage();
            
            // 显示成功消息
            showMessage('分数线已重置为默认值', 'success');
            
            // 清除旧版本的key
            localStorage.removeItem('passScore');
            localStorage.removeItem('goodScore');
            localStorage.removeItem('excellentScore');
        });
    }
    
    // 输入验证：确保良好线大于及格线，优秀线大于良好线
    passScoreInput.addEventListener('change', validateThresholds);
    goodScoreInput.addEventListener('change', validateThresholds);
    excellentScoreInput.addEventListener('change', validateThresholds);
}

/**
 * 验证分数线设置的合理性
 */
function validateThresholds() {
    const passScoreInput = document.getElementById('passScore');
    const goodScoreInput = document.getElementById('goodScore');
    const excellentScoreInput = document.getElementById('excellentScore');
    
    if (!passScoreInput || !goodScoreInput || !excellentScoreInput) return;
    
    let passScore = parseInt(passScoreInput.value) || 0;
    let goodScore = parseInt(goodScoreInput.value) || 0;
    let excellentScore = parseInt(excellentScoreInput.value) || 0;
    
    // 确保值在合理范围内
    passScore = Math.max(0, Math.min(100, passScore));
    goodScore = Math.max(0, Math.min(100, goodScore));
    excellentScore = Math.max(0, Math.min(150, excellentScore));
    
    // 确保分数线递增
    if (goodScore < passScore) {
        goodScore = passScore;
    }
    
    if (excellentScore < goodScore) {
        excellentScore = goodScore;
    }
    
    // 更新输入框的值
    passScoreInput.value = passScore;
    goodScoreInput.value = goodScore;
    excellentScoreInput.value = excellentScore;
}

/**
 * 保存分数线设置
 */
function saveThresholds() {
    const passScoreInput = document.getElementById('passScore');
    const goodScoreInput = document.getElementById('goodScore');
    const excellentScoreInput = document.getElementById('excellentScore');
    
    if (!passScoreInput || !goodScoreInput || !excellentScoreInput) return;
    
    // 验证分数线设置
    validateThresholds();
    
    // 更新当前分数线设置
    currentThresholds = {
        passScore: parseInt(passScoreInput.value),
        goodScore: parseInt(goodScoreInput.value),
        excellentScore: parseInt(excellentScoreInput.value)
    };
    
    // 保存到本地存储
    saveThresholdsToStorage();
    
    showMessage('分数线设置已保存', 'success');
}

/**
 * 从本地存储加载分数线设置
 */
function loadThresholdsFromStorage() {
    const storedThresholds = localStorage.getItem('gradeAnalysisThresholds');
    if (storedThresholds) {
        try {
            const thresholds = JSON.parse(storedThresholds);
            // 确保所有必需的属性都存在
            if (typeof thresholds.passScore === 'number' && 
                typeof thresholds.goodScore === 'number' && 
                typeof thresholds.excellentScore === 'number') {
                currentThresholds = thresholds;
            }
        } catch (error) {
            console.error('解析分数线设置时出错:', error);
            // 如果出错，使用默认设置
            currentThresholds = {...DEFAULT_THRESHOLDS};
        }
    }
}

/**
 * 保存分数线设置到本地存储
 */
function saveThresholdsToStorage() {
    try {
        localStorage.setItem('gradeAnalysisThresholds', JSON.stringify(currentThresholds));
    } catch (error) {
        console.error('保存分数线设置时出错:', error);
        showMessage('保存分数线设置失败', 'error');
    }
}

/**
 * 初始化文件列表模块
 */
function initFileListModule() {
    // 获取文件列表表格和空状态提示
    const fileListTable = document.getElementById('fileListTable');
    const emptyFileList = document.getElementById('emptyFileList');
    
    // 如果元素不存在，表示不在文件列表页面，直接返回
    if (!fileListTable || !emptyFileList) return;
    
    // 加载文件列表
    refreshFileList();
    
    // 监听导航事件，当切换到文件列表标签时刷新列表
    const fileListLink = document.querySelector('nav a[data-section="file-list-section"]');
    if (fileListLink) {
        fileListLink.addEventListener('click', refreshFileList);
    }
}

/**
 * 刷新文件列表
 */
function refreshFileList() {
    // 获取文件列表表格和空状态提示
    const fileListTable = document.getElementById('fileListTable');
    const fileListTableBody = fileListTable ? fileListTable.querySelector('tbody') : null;
    const emptyFileList = document.getElementById('emptyFileList');
    
    if (!fileListTable || !fileListTableBody || !emptyFileList) return;
    
    // 清空表格内容
    fileListTableBody.innerHTML = '';
    
    // 获取所有文件数据
    const allFiles = getAllFilesFromStorage();
    
    // 如果没有文件，显示空状态提示
    if (allFiles.length === 0) {
        fileListTable.style.display = 'none';
        emptyFileList.style.display = 'block';
        return;
    }
    
    // 显示文件列表，隐藏空状态提示
    fileListTable.style.display = 'table';
    emptyFileList.style.display = 'none';
    
    // 按上传时间倒序排序
    allFiles.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    // 填充文件列表
    allFiles.forEach(file => {
        const row = document.createElement('tr');
        
        // 格式化日期
        const fileDate = file.date ? new Date(file.date).toLocaleDateString('zh-CN') : '无日期';
        const uploadTime = new Date(file.uploadTime).toLocaleString('zh-CN');
        
        // 设置行内容
        row.innerHTML = `
            <td>${file.name || '未命名文件'}</td>
            <td>${fileDate}</td>
            <td>${file.class || '未指定班级'}</td>
            <td>${uploadTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn delete-btn" data-id="${file.id}">删除</button>
                </div>
            </td>
        `;
        
        // 添加行到表格
        fileListTableBody.appendChild(row);
    });
    
    // 为操作按钮添加事件监听
    addButtonEventListeners();
}

/**
 * 为文件列表中的按钮添加事件监听
 */
function addButtonEventListeners() {
    // 获取所有删除按钮
    const deleteButtons = document.querySelectorAll('.file-list-table .delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.getAttribute('data-id');
            deleteFileConfirm(fileId);
        });
    });
}

/**
 * 确认并删除文件
 * @param {string} fileId - 文件ID
 */
function deleteFileConfirm(fileId) {
    const fileData = getFileById(fileId);
    if (!fileData) {
        showMessage('无法找到文件数据', 'error');
        return;
    }
    
    // 创建确认对话框元素
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="confirm-dialog-content">
            <h3>确认删除</h3>
            <p>您确定要删除文件 "${fileData.name}" 吗？此操作无法撤销。</p>
            <div class="confirm-dialog-buttons">
                <button id="cancelDeleteBtn" class="btn secondary-btn">取消</button>
                <button id="confirmDeleteBtn" class="btn primary-btn">删除</button>
            </div>
        </div>
    `;
    
    // 添加对话框样式
    const dialogStyle = document.createElement('style');
    dialogStyle.textContent = `
        .confirm-dialog {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .confirm-dialog-content {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .confirm-dialog h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #dc3545;
        }
        
        .confirm-dialog p {
            margin-bottom: 20px;
        }
        
        .confirm-dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
    `;
    
    document.head.appendChild(dialogStyle);
    document.body.appendChild(confirmDialog);
    
    // 添加按钮事件
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        document.body.removeChild(confirmDialog);
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const success = deleteFileById(fileId);
        if (success) {
            showMessage('文件已成功删除', 'success');
            refreshFileList();
        } else {
            showMessage('删除文件失败', 'error');
        }
        document.body.removeChild(confirmDialog);
    });
} 