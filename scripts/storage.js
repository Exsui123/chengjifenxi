/**
 * 成绩分析系统 - 存储模块脚本
 * 负责数据的本地存储和获取
 */

// 存储键名
const STORAGE_KEY = 'gradeAnalysisData';

/**
 * 从本地存储获取所有文件数据
 * @returns {Array} 文件数据数组
 */
function getAllFilesFromStorage() {
    console.log('开始从本地存储获取所有文件数据...');
    const dataString = localStorage.getItem(STORAGE_KEY);
    
    if (!dataString) {
        console.log('本地存储中没有文件数据');
        return [];
    }
    
    console.log(`从本地存储获取的数据长度: ${dataString.length} 字符`);
    
    try {
        const parsedData = JSON.parse(dataString);
        
        if (!Array.isArray(parsedData)) {
            console.error('解析的数据不是数组格式', parsedData);
            return [];
        }
        
        console.log(`成功解析数据，共有 ${parsedData.length} 个文件`);
        
        // 验证每个文件对象的格式是否正确
        const validFiles = parsedData.filter(file => {
            const isValid = file && file.id && file.data && Array.isArray(file.data);
            if (!isValid) {
                console.warn('发现无效的文件数据:', file);
            }
            return isValid;
        });
        
        if (validFiles.length < parsedData.length) {
            console.warn(`过滤后的有效文件数量: ${validFiles.length}，原始数量: ${parsedData.length}`);
        }
        
        // 检查每个文件的数据结构
        validFiles.forEach(file => {
            console.log(`文件 ID: ${file.id}, 名称: ${file.name}, 数据行数: ${file.data.length}`);
            if (file.data.length === 0) {
                console.warn(`文件 ${file.id} 不包含任何数据行`);
            }
            if (!file.data[0] || !Array.isArray(file.data[0])) {
                console.warn(`文件 ${file.id} 表头数据不正确:`, file.data[0]);
            }
        });
        
        return validFiles;
    } catch (error) {
        console.error('解析本地存储数据时出错:', error);
        console.error('原始数据字符串:', dataString);
        return [];
    }
}

/**
 * 保存文件数据到本地存储
 * @param {Object} fileData - 要保存的文件数据对象
 * @returns {boolean} 保存是否成功
 */
function saveToStorage(fileData) {
    if (!fileData) {
        console.error('保存失败：文件数据为空');
        return false;
    }
    
    console.log('开始保存文件到本地存储...');
    
    // 验证文件数据格式是否正确
    if (!fileData.id || !fileData.data || !Array.isArray(fileData.data)) {
        console.error('保存失败：文件数据格式不正确', fileData);
        return false;
    }
    
    console.log(`保存文件 ID: ${fileData.id}, 名称: ${fileData.name}, 数据行数: ${fileData.data.length}`);
    
    // 获取现有数据
    const existingData = getAllFilesFromStorage();
    console.log(`当前本地存储中有 ${existingData.length} 个文件`);
    
    // 检查是否已存在相同ID的文件
    const duplicateIndex = existingData.findIndex(file => file.id === fileData.id);
    if (duplicateIndex >= 0) {
        console.warn(`存在相同ID的文件，将被覆盖: ${fileData.id}`);
        existingData[duplicateIndex] = fileData;
    } else {
        // 添加新数据
        existingData.push(fileData);
        console.log(`文件已添加到列表，新总数: ${existingData.length}`);
    }
    
    // 保存回本地存储
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
        console.log('文件成功保存到本地存储');
        return true;
    } catch (error) {
        console.error('保存数据到本地存储时出错:', error);
        // 如果是存储空间不足错误，尝试清理一些数据
        if (error.name === 'QuotaExceededError') {
            showMessage('本地存储空间不足，请删除一些旧数据', 'error');
        }
        return false;
    }
}

/**
 * 根据ID获取特定文件数据
 * @param {string} fileId - 文件ID
 * @returns {Object|null} 文件数据对象或null
 */
function getFileById(fileId) {
    console.log(`尝试获取文件, ID: ${fileId}`);
    const allFiles = getAllFilesFromStorage();
    console.log(`本地存储中共有 ${allFiles.length} 个文件`);
    
    if (allFiles.length === 0) {
        console.warn('本地存储中没有文件数据');
        return null;
    }
    
    const foundFile = allFiles.find(file => file.id === fileId);
    
    if (foundFile) {
        console.log(`找到文件: ${foundFile.name}, 数据行数: ${foundFile.data ? foundFile.data.length : '未知'}`);
        // 检查文件数据是否完整
        if (!foundFile.data || !Array.isArray(foundFile.data)) {
            console.error(`文件数据不完整或格式错误: ${fileId}`);
            console.log('文件内容:', foundFile);
        }
    } else {
        console.warn(`未找到ID为 ${fileId} 的文件`);
    }
    
    return foundFile || null;
}

/**
 * 删除指定ID的文件数据
 * @param {string} fileId - 文件ID
 * @returns {boolean} 删除是否成功
 */
function deleteFileById(fileId) {
    const allFiles = getAllFilesFromStorage();
    const initialLength = allFiles.length;
    
    // 过滤掉要删除的文件
    const filteredFiles = allFiles.filter(file => file.id !== fileId);
    
    // 如果长度没变，说明没找到文件
    if (filteredFiles.length === initialLength) {
        return false;
    }
    
    // 保存回本地存储
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredFiles));
        return true;
    } catch (error) {
        console.error('保存数据到本地存储时出错:', error);
        return false;
    }
}

/**
 * 更新指定ID的文件数据
 * @param {string} fileId - 文件ID
 * @param {Object} updatedData - 更新后的文件数据
 * @returns {boolean} 更新是否成功
 */
function updateFileById(fileId, updatedData) {
    if (!fileId || !updatedData) return false;
    
    const allFiles = getAllFilesFromStorage();
    const fileIndex = allFiles.findIndex(file => file.id === fileId);
    
    // 如果没找到文件
    if (fileIndex === -1) {
        return false;
    }
    
    // 更新文件数据
    allFiles[fileIndex] = {...allFiles[fileIndex], ...updatedData};
    
    // 保存回本地存储
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
        return true;
    } catch (error) {
        console.error('保存数据到本地存储时出错:', error);
        return false;
    }
}

/**
 * 清空所有存储的文件数据
 * @returns {boolean} 清空是否成功
 */
function clearAllFilesFromStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('清空本地存储时出错:', error);
        return false;
    }
}

/**
 * 导出所有文件数据为JSON文件
 */
function exportAllData() {
    const allFiles = getAllFilesFromStorage();
    if (allFiles.length === 0) {
        showMessage('没有可导出的数据', 'error');
        return;
    }
    
    // 创建JSON数据
    const dataStr = JSON.stringify(allFiles, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = `成绩分析数据_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showMessage('数据导出成功', 'success');
}

/**
 * 导入JSON文件数据
 * @param {File} file - JSON文件对象
 */
function importDataFromJson(file) {
    if (!file || file.type !== 'application/json') {
        showMessage('请选择有效的JSON文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData)) {
                showMessage('导入的数据格式不正确', 'error');
                return;
            }
            
            // 验证每个文件对象的格式
            const validData = importedData.filter(item => 
                item && item.id && item.name && item.data && Array.isArray(item.data)
            );
            
            if (validData.length === 0) {
                showMessage('导入的数据不包含有效的成绩文件', 'error');
                return;
            }
            
            // 获取现有数据
            const existingData = getAllFilesFromStorage();
            
            // 合并数据，避免重复ID
            const existingIds = new Set(existingData.map(item => item.id));
            const newData = [...existingData];
            
            let addedCount = 0;
            for (const item of validData) {
                if (!existingIds.has(item.id)) {
                    newData.push(item);
                    existingIds.add(item.id);
                    addedCount++;
                }
            }
            
            // 保存回本地存储
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            
            showMessage(`成功导入${addedCount}个文件数据`, 'success');
            
            // 刷新文件列表
            if (typeof refreshFileList === 'function') {
                refreshFileList();
            }
            
        } catch (error) {
            showMessage('解析导入文件时出错: ' + error.message, 'error');
            console.error('导入数据错误:', error);
        }
    };
    
    reader.onerror = function() {
        showMessage('读取文件时出错', 'error');
    };
    
    reader.readAsText(file);
} 