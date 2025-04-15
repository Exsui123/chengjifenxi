/**
 * 成绩分析系统 - 数据分析模块脚本
 * 负责数据分析和可视化功能
 */

// 当前选择的分析类型
let selectedAnalysisType = null;
// 当前选择的文件ID列表
let selectedFileIds = [];
// 所有选中文件的科目列表
let availableSubjects = [];
// 当前选择的科目
let selectedSubject = '';
// 所有文件的缓存
let allFilesCache = [];

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    initAnalysisModule();
});

/**
 * 初始化数据分析模块
 */
function initAnalysisModule() {
    // 获取分析类型下拉框
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    // 获取生成趋势图按钮
    const generateTrendBtn = document.getElementById('generateTrendBtn');
    
    // 如果元素不存在，表示不在分析页面，直接返回
    if (!analysisTypeSelect) return;
    
    // 分析类型选择变化事件
    analysisTypeSelect.addEventListener('change', function() {
        selectedAnalysisType = this.value;
        
        // 根据选择的分析类型显示不同的选项
        if (selectedAnalysisType === 'personal-trend') {
            showTrendAnalysisOptions();
        } else {
            hideTrendAnalysisOptions();
            
            if (selectedAnalysisType) {
                performAnalysis();
            } else {
                clearAnalysisResult();
            }
        }
    });
    
    // 初始化自定义下拉框
    initCustomDropdown();
    
    // 科目选择变化事件
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', function() {
            selectedSubject = this.value;
            updateGenerateButtonState();
        });
    }
    
    // 生成趋势图按钮点击事件
    if (generateTrendBtn) {
        generateTrendBtn.addEventListener('click', function() {
            if (selectedFileIds.length > 0 && selectedSubject) {
                performTrendAnalysis();
            }
        });
    }
}

/**
 * 初始化自定义下拉框
 */
function initCustomDropdown() {
    const dropdownSelected = document.querySelector('.dropdown-selected');
    const dropdown = document.querySelector('.custom-dropdown');
    
    if (!dropdownSelected || !dropdown) return;
    
    // 点击下拉框切换显示/隐藏菜单
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        
        // 如果打开下拉菜单，加载文件选项
        if (dropdown.classList.contains('open')) {
            loadFileDropdownItems();
        }
    });
    
    // 点击页面其他区域关闭下拉菜单
    document.addEventListener('click', function() {
        dropdown.classList.remove('open');
    });
    
    // 阻止点击下拉菜单时关闭
    const dropdownMenu = document.getElementById('fileDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

/**
 * 显示趋势分析选项
 */
function showTrendAnalysisOptions() {
    const trendOptions = document.getElementById('trendAnalysisOptions');
    if (trendOptions) {
        trendOptions.style.display = 'block';
        
        // 加载所有文件
        loadAllFiles();
        
        // 清空分析结果区域
        clearAnalysisResult();
    }
}

/**
 * 隐藏趋势分析选项
 */
function hideTrendAnalysisOptions() {
    const trendOptions = document.getElementById('trendAnalysisOptions');
    if (trendOptions) {
        trendOptions.style.display = 'none';
    }
    
    // 重置下拉框文本
    const selectedText = document.querySelector('.dropdown-selected .selected-text');
    if (selectedText) {
        selectedText.textContent = '-- 请选择成绩表 --';
    }
    
    // 重置选择状态
    selectedFileIds = [];
    availableSubjects = [];
    selectedSubject = '';
    updateSelectedFilesList();
}

/**
 * 加载所有文件
 */
function loadAllFiles() {
    // 获取所有文件数据
    allFilesCache = getAllFilesFromStorage();
    
    // 按日期倒序排序
    allFilesCache.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    // 清空已选文件
    selectedFileIds = [];
    updateSelectedFilesList();
}

/**
 * 加载文件下拉选项
 */
function loadFileDropdownItems() {
    const dropdownMenu = document.getElementById('fileDropdownMenu');
    if (!dropdownMenu) return;
    
    // 清空现有选项
    dropdownMenu.innerHTML = '';
    
    // 如果没有文件，显示提示
    if (allFilesCache.length === 0) {
        dropdownMenu.innerHTML = '<div class="dropdown-item disabled">没有可用的成绩表，请先上传数据</div>';
        return;
    }
    
    // 添加文件选项
    allFilesCache.forEach(file => {
        const isSelected = selectedFileIds.includes(file.id);
        const itemClass = isSelected ? 'dropdown-item selected' : 'dropdown-item';
        
        // 格式化日期
        const fileDate = file.date ? new Date(file.date).toLocaleDateString('zh-CN') : '无日期';
        
        const item = document.createElement('div');
        item.className = itemClass;
        item.dataset.fileId = file.id;
        
        item.innerHTML = `
            <div class="checkbox-indicator"></div>
            <div class="dropdown-item-text">${file.name || '未命名文件'} (${fileDate}, ${file.class || '未指定班级'})</div>
        `;
        
        // 添加点击事件
        item.addEventListener('click', function() {
            const fileId = this.dataset.fileId;
            
            if (selectedFileIds.includes(fileId)) {
                // 取消选择
                selectedFileIds = selectedFileIds.filter(id => id !== fileId);
                this.classList.remove('selected');
            } else {
                // 选择文件
                selectedFileIds.push(fileId);
                this.classList.add('selected');
            }
            
            // 更新已选文件列表
            updateSelectedFilesList();
            
            // 更新科目选择列表
            updateSubjectOptions();
            
            // 更新生成按钮状态
            updateGenerateButtonState();
        });
        
        dropdownMenu.appendChild(item);
    });
}

/**
 * 更新已选择的文件列表
 */
function updateSelectedFilesList() {
    const selectedFilesList = document.getElementById('selectedFilesList');
    const selectedText = document.querySelector('.dropdown-selected .selected-text');
    
    if (!selectedFilesList) return;
    
    // 清空现有内容
    selectedFilesList.innerHTML = '';
    
    // 如果没有选择任何文件，显示提示
    if (selectedFileIds.length === 0) {
        selectedFilesList.innerHTML = '<div class="empty-selected">未选择任何成绩表</div>';
        if (selectedText) {
            selectedText.textContent = '-- 请选择成绩表 --';
        }
        return;
    }
    
    // 更新下拉框显示文本
    if (selectedText) {
        selectedText.textContent = `已选择 ${selectedFileIds.length} 个成绩表`;
    }
    
    // 获取已选文件名称数组
    const selectedFileNames = selectedFileIds.map(fileId => {
        const file = allFilesCache.find(f => f.id === fileId);
        if (!file) return '';
        return file.name || '未命名文件';
    }).filter(name => name !== ''); // 过滤掉空名称
    
    // 使用顿号连接文件名
    selectedFilesList.textContent = selectedFileNames.join('、');
}

/**
 * 更新科目选择列表
 */
function updateSubjectOptions() {
    const subjectSelect = document.getElementById('subjectSelect');
    if (!subjectSelect) return;
    
    // 清空现有选项，只保留默认选项
    while (subjectSelect.options.length > 0) {
        subjectSelect.remove(0);
    }
    
    // 如果没有选择文件，禁用科目选择
    if (selectedFileIds.length === 0) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 请先选择成绩表 --';
        subjectSelect.appendChild(defaultOption);
        
        subjectSelect.disabled = true;
        return;
    }
    
    // 启用科目选择
    subjectSelect.disabled = false;
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 请选择科目 --';
    subjectSelect.appendChild(defaultOption);
    
    // 获取所有选中文件的科目
    availableSubjects = getSubjectsFromSelectedFiles();
    
    // 添加"全部科目"选项
    const allSubjectsOption = document.createElement('option');
    allSubjectsOption.value = 'all';
    allSubjectsOption.textContent = '全部科目';
    subjectSelect.appendChild(allSubjectsOption);
    
    // 添加各个科目选项
    availableSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

/**
 * 从选中的文件中获取科目列表
 * @returns {Array} 科目列表
 */
function getSubjectsFromSelectedFiles() {
    const subjects = new Set();
    
    // 遍历所有选中的文件
    selectedFileIds.forEach(fileId => {
        const fileData = getFileById(fileId);
        if (fileData && fileData.data && fileData.data.length > 0) {
            // 假设科目是表头（第一行）
            const headers = fileData.data[0];
            
            // 通常第一列是学生ID或姓名，第二列开始才是科目
            for (let i = 1; i < headers.length; i++) {
                if (headers[i] && typeof headers[i] === 'string') {
                    subjects.add(headers[i]);
                }
            }
        }
    });
    
    return Array.from(subjects);
}

/**
 * 更新生成按钮状态
 */
function updateGenerateButtonState() {
    const generateTrendBtn = document.getElementById('generateTrendBtn');
    if (!generateTrendBtn) return;
    
    // 当选择了至少一个文件且选择了科目时，启用生成按钮
    generateTrendBtn.disabled = !(selectedFileIds.length > 0 && selectedSubject);
}

/**
 * 执行趋势分析
 */
function performTrendAnalysis() {
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    // 显示加载状态
    analysisResult.innerHTML = `
        <div class="loading-analysis">
            <p>正在分析数据，请稍候...</p>
        </div>
    `;
    
    // 执行个人成绩变化趋势分析
    showPersonalTrendAnalysis();
}

/**
 * 执行数据分析
 */
function performAnalysis() {
    if (!selectedAnalysisType) {
        return;
    }
    
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    // 显示加载状态
    analysisResult.innerHTML = `
        <div class="loading-analysis">
            <p>正在分析数据，请稍候...</p>
        </div>
    `;
    
    // 根据不同的分析类型执行不同的分析
    switch (selectedAnalysisType) {
        case 'basic':
            showBasicAnalysis();
            break;
        case 'personal-detail':
            showPersonalDetailAnalysis();
            break;
        default:
            clearAnalysisResult();
            break;
    }
}

/**
 * 显示基础指标分析
 */
function showBasicAnalysis() {
    // 这个函数将在后续开发中实现
    // 暂时只显示一个占位信息
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    analysisResult.innerHTML = `
        <div class="analysis-info">
            <h3>基础指标分析</h3>
            <p>此功能尚在开发中，敬请期待...</p>
        </div>
    `;
}

/**
 * 显示个人成绩详情分析
 */
function showPersonalDetailAnalysis() {
    // 这个函数将在后续开发中实现
    // 暂时只显示一个占位信息
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    analysisResult.innerHTML = `
        <div class="analysis-info">
            <h3>个人成绩详情分析</h3>
            <p>此功能尚在开发中，敬请期待...</p>
        </div>
    `;
}

/**
 * 显示个人成绩变化趋势分析
 */
function showPersonalTrendAnalysis() {
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    // 检查是否选择了文件和科目
    if (selectedFileIds.length === 0 || !selectedSubject) {
        analysisResult.innerHTML = `
            <div class="analysis-info">
                <h3>个人成绩变化趋势分析</h3>
                <p>请选择至少一个成绩表和一个科目</p>
            </div>
        `;
        return;
    }
    
    // 目前只是显示一个占位信息，表示正在开发中
    analysisResult.innerHTML = `
        <div class="analysis-info">
            <h3>个人成绩变化趋势分析</h3>
            <p>选择的文件数量: ${selectedFileIds.length}</p>
            <p>选择的科目: ${selectedSubject === 'all' ? '全部科目' : selectedSubject}</p>
            <p>此功能的具体图表正在开发中，敬请期待...</p>
        </div>
    `;
}

/**
 * 清空分析结果区域
 */
function clearAnalysisResult() {
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    analysisResult.innerHTML = `
        <div class="empty-analysis">
            <p>请选择分析类型</p>
        </div>
    `;
} 