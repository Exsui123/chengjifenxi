/**
 * 成绩分析系统 - 上传模块脚本
 * 负责文件上传、解析和预览功能
 */

// 当前已选文件
let currentFile = null;
// 解析后的数据
let parsedData = null;
// 当前页码
let currentPage = 1;
// 每页行数
let rowsPerPage = 10;
// 总页数
let totalPages = 1;

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    initUploadModule();
});

/**
 * 初始化上传模块功能
 */
function initUploadModule() {
    // 获取DOM元素
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const previewSection = document.getElementById('previewSection');
    const previewTable = document.getElementById('previewTable');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveDataBtn = document.getElementById('saveDataBtn');
    
    // 分页控制元素
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    // 如果元素不存在，表示不在上传页面，直接返回
    if (!dropArea || !fileInput) return;
    
    // 为文件输入框添加change事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 为清除按钮添加点击事件
    clearFileBtn.addEventListener('click', clearSelectedFile);
    
    // 为取消按钮添加点击事件
    cancelBtn.addEventListener('click', clearSelectedFile);
    
    // 为保存按钮添加点击事件
    saveDataBtn.addEventListener('click', saveFileData);
    
    // 为分页按钮添加事件
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', goToPreviousPage);
        nextPageBtn.addEventListener('click', goToNextPage);
    }
    
    // 拖放功能
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('active');
    });
    
    dropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('active');
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
}

/**
 * 处理文件选择事件
 * @param {Event} event - 文件选择事件
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
        showMessage('请上传Excel(.xlsx, .xls)或CSV(.csv)文件！', 'error');
        return;
    }
    
    // 保存当前文件
    currentFile = file;
    
    // 显示文件信息
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
    
    // 重置分页
    currentPage = 1;
    
    // 解析文件
    parseFile(file);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小(字节)
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 解析上传的文件
 * @param {File} file - 上传的文件对象
 */
function parseFile(file) {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (['xlsx', 'xls'].includes(fileType)) {
        // 使用xlsx库解析Excel文件
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheet];
                parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                displayPreview(parsedData);
            } catch (error) {
                showMessage('解析Excel文件时出错: ' + error.message, 'error');
                console.error('Excel解析错误:', error);
                clearSelectedFile();
            }
        };
        reader.onerror = function() {
            showMessage('读取文件时出错', 'error');
            clearSelectedFile();
        };
        reader.readAsArrayBuffer(file);
    } else if (fileType === 'csv') {
        // 使用PapaParse库解析CSV文件
        Papa.parse(file, {
            complete: function(results) {
                if (results.errors.length > 0) {
                    showMessage('解析CSV文件时出错', 'error');
                    console.error('CSV解析错误:', results.errors);
                    clearSelectedFile();
                    return;
                }
                parsedData = results.data;
                displayPreview(parsedData);
            },
            error: function(error) {
                showMessage('解析CSV文件时出错: ' + error.message, 'error');
                console.error('CSV解析错误:', error);
                clearSelectedFile();
            }
        });
    }
}

/**
 * 显示数据预览
 * @param {Array} data - 解析后的数据数组
 */
function displayPreview(data) {
    if (!data || data.length === 0) {
        showMessage('文件不包含有效数据', 'error');
        clearSelectedFile();
        return;
    }
    
    // 计算总页数
    const dataBody = data.slice(1); // 除去表头的数据
    totalPages = Math.ceil(dataBody.length / rowsPerPage);
    
    // 更新分页信息
    updatePaginationInfo(dataBody.length);
    
    // 渲染当前页数据
    renderTablePage(data);
    
    // 生成分页按钮
    generatePaginationButtons();
    
    // 显示预览部分
    document.getElementById('previewSection').style.display = 'block';
    
    // 自动分析数据，检查第一行是否包含学科名称
    validateDataFormat(data[0]);
}

/**
 * 渲染表格当前页
 * @param {Array} data - 完整数据
 */
function renderTablePage(data) {
    if (!data || data.length === 0) return;
    
    // 获取预览表格
    const previewTable = document.getElementById('previewTable');
    
    // 清空表格
    previewTable.innerHTML = '';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 假设第一行是表头
    const headers = data[0];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || '未命名列';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    previewTable.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    // 计算当前页的起始和结束索引
    const startIndex = (currentPage - 1) * rowsPerPage + 1; // +1 是因为第0行是表头
    const endIndex = Math.min(startIndex + rowsPerPage, data.length);
    
    // 获取当前页数据
    const pageRows = data.slice(startIndex, endIndex);
    
    // 渲染行
    pageRows.forEach(row => {
        const tr = document.createElement('tr');
        
        // 处理每个单元格
        row.forEach((cell, index) => {
            const td = document.createElement('td');
            // 确保显示空值
            td.textContent = cell !== undefined && cell !== null ? cell : '';
            tr.appendChild(td);
        });
        
        // 如果行的单元格数小于表头数，添加空单元格
        if (row.length < headers.length) {
            for (let i = row.length; i < headers.length; i++) {
                const td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        
        tbody.appendChild(tr);
    });
    
    previewTable.appendChild(tbody);
    
    // 更新分页信息
    updatePageDisplay();
}

/**
 * 更新分页信息显示
 */
function updatePaginationInfo(totalRowCount) {
    const totalRowsElement = document.getElementById('totalRows');
    if (totalRowsElement) {
        totalRowsElement.textContent = totalRowCount;
    }
}

/**
 * 更新页面显示
 */
function updatePageDisplay() {
    // 更新页码信息
    const pageStartElement = document.getElementById('pageStart');
    const pageEndElement = document.getElementById('pageEnd');
    
    if (pageStartElement && pageEndElement && parsedData) {
        const dataBody = parsedData.slice(1); // 除去表头的数据
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(startIndex + rowsPerPage - 1, dataBody.length);
        
        pageStartElement.textContent = startIndex;
        pageEndElement.textContent = endIndex;
    }
    
    // 更新按钮状态
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // 更新分页按钮状态
    updatePaginationButtons();
}

/**
 * 生成分页按钮
 */
function generatePaginationButtons() {
    const paginationNumbers = document.getElementById('paginationNumbers');
    if (!paginationNumbers) return;
    
    // 清空现有按钮
    paginationNumbers.innerHTML = '';
    
    // 决定显示哪些页码按钮
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(startPage + 4, totalPages);
    
    // 调整起始页，确保总是显示5个按钮（如果有足够多的页）
    if (endPage - startPage < 4 && totalPages > 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 生成页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('div');
        pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.setAttribute('data-page', i);
        
        // 添加点击事件
        pageButton.addEventListener('click', function() {
            goToPage(parseInt(this.getAttribute('data-page')));
        });
        
        paginationNumbers.appendChild(pageButton);
    }
}

/**
 * 更新分页按钮状态
 */
function updatePaginationButtons() {
    const paginationNumbers = document.getElementById('paginationNumbers');
    if (!paginationNumbers) return;
    
    // 更新按钮活动状态
    const pageButtons = paginationNumbers.querySelectorAll('.page-number');
    pageButtons.forEach(button => {
        const pageNum = parseInt(button.getAttribute('data-page'));
        if (pageNum === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * 跳转到上一页
 */
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTablePage(parsedData);
    }
}

/**
 * 跳转到下一页
 */
function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderTablePage(parsedData);
    }
}

/**
 * 跳转到指定页
 * @param {number} pageNumber - 页码
 */
function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        renderTablePage(parsedData);
    }
}

/**
 * 验证数据格式，检查是否符合系统要求
 * @param {Array} headers - 数据表头
 */
function validateDataFormat(headers) {
    // 简单检查：至少有3个列，第一列应该包含学生ID或姓名
    if (headers.length < 3) {
        showMessage('数据格式可能不正确，至少需要包含学生信息和两个学科', 'error');
        return false;
    }
    
    // 检查是否包含常见学科名称（简单判断）
    const commonSubjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
    let foundSubjects = 0;
    
    headers.forEach(header => {
        if (commonSubjects.some(subject => header && header.includes(subject))) {
            foundSubjects++;
        }
    });
    
    if (foundSubjects === 0) {
        showMessage('未检测到常见学科名称，请确认数据格式是否正确', 'info');
        return false;
    }
    
    showMessage(`成功检测到${foundSubjects}个学科`, 'success');
    return true;
}

/**
 * 清除已选文件和预览
 */
function clearSelectedFile() {
    // 重置状态
    currentFile = null;
    parsedData = null;
    currentPage = 1;
    totalPages = 1;
    
    // 清空文件输入框
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    // 隐藏文件信息和预览
    const fileInfo = document.getElementById('fileInfo');
    const previewSection = document.getElementById('previewSection');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (previewSection) previewSection.style.display = 'none';
}

/**
 * 保存文件数据
 */
function saveFileData() {
    if (!parsedData || !currentFile) {
        showMessage('没有可保存的数据', 'error');
        return;
    }
    
    // 获取文件信息表单的值
    const dataName = document.getElementById('dataName').value.trim();
    const dataDate = document.getElementById('dataDate').value;
    const dataClass = document.getElementById('dataClass').value.trim();
    
    // 表单验证
    if (!dataName) {
        showMessage('请输入数据名称', 'error');
        return;
    }
    
    if (!dataClass) {
        showMessage('请输入班级信息', 'error');
        return;
    }
    
    // 构建文件信息对象
    const fileData = {
        id: generateUUID(),
        name: dataName,
        date: dataDate,
        class: dataClass,
        uploadTime: new Date().toISOString(),
        data: parsedData
    };
    
    // 保存到本地存储
    saveToStorage(fileData);
    
    // 显示成功消息
    showMessage('数据已成功保存', 'success');
    
    // 清除当前文件
    clearSelectedFile();
    
    // 切换到文件列表页面
    const fileListLink = document.querySelector('nav a[data-section="file-list-section"]');
    if (fileListLink) {
        fileListLink.click();
    }
}

/**
 * 生成UUID
 * @returns {string} 生成的UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
} 