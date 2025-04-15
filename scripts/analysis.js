/**
 * 成绩分析系统 - 数据分析模块脚本
 * 负责数据分析和可视化功能
 */

// 注册Chart.js的datalabels插件
if (window.Chart && window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
}

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
    // 获取生成详情图按钮
    const generateDetailBtn = document.getElementById('generateDetailBtn');
    // 获取生成基础指标分析按钮
    const generateBasicBtn = document.getElementById('generateBasicBtn');
    
    // 如果元素不存在，表示不在分析页面，直接返回
    if (!analysisTypeSelect) return;
    
    // 分析类型选择变化事件
    analysisTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        // 隐藏所有分析选项区域
        hideAllAnalysisOptions();
        
        // 显示所选分析类型的选项
        switch (selectedValue) {
            case 'basic':
                // 基本指标分析
                console.log('选择了基本指标分析');
                showBasicAnalysisOptions();
                clearAnalysisResult();
                break;
            case 'personal-detail':
                // 显示个人成绩详情分析选项
                console.log('选择了个人成绩详情分析');
                showDetailAnalysisOptions();
                clearAnalysisResult();
                break;
            case 'personal-trend':
                // 显示个人趋势分析选项
                console.log('选择了个人趋势分析');
                showTrendAnalysisOptions();
                clearAnalysisResult();
                break;
            default:
                // 没有选择任何分析类型
                console.log('未选择分析类型');
                clearAnalysisResult();
                break;
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
    
    // 学生选择变化事件
    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect) {
        studentSelect.addEventListener('change', function() {
            updateGenerateButtonState();
        });
    }
    
    // 详情分析的学生选择变化事件
    const detailStudentSelect = document.getElementById('detailStudentSelect');
    if (detailStudentSelect) {
        detailStudentSelect.addEventListener('change', function() {
            updateGenerateDetailButtonState();
        });
    }
    
    // 详情分析的科目选择变化事件
    const detailSubjectSelect = document.getElementById('detailSubjectSelect');
    if (detailSubjectSelect) {
        detailSubjectSelect.addEventListener('change', function() {
            updateGenerateDetailButtonState();
        });
    }
    
    // 基础指标分析的科目选择变化事件
    const basicSubjectSelect = document.getElementById('basicSubjectSelect');
    if (basicSubjectSelect) {
        basicSubjectSelect.addEventListener('change', function() {
            updateGenerateBasicButtonState();
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
    
    // 生成详情图按钮点击事件
    if (generateDetailBtn) {
        generateDetailBtn.addEventListener('click', function() {
            if (selectedFileIds.length > 0) {
                performDetailAnalysis();
            }
        });
    }
    
    // 生成基础指标分析按钮点击事件
    if (generateBasicBtn) {
        generateBasicBtn.addEventListener('click', function() {
            if (selectedFileIds.length > 0) {
                performBasicAnalysis();
            }
        });
    }
}

/**
 * 初始化自定义下拉框
 */
function initCustomDropdown() {
    // 初始化趋势分析下拉框
    initDropdown('.dropdown-selected:not(.detail-dropdown-selected):not(.basic-dropdown-selected)', 'fileDropdownMenu');
    
    // 初始化详情分析下拉框
    initDropdown('.detail-dropdown-selected', 'detailFileDropdownMenu');
    
    // 初始化基础指标分析下拉框
    initDropdown('.basic-dropdown-selected', 'basicFileDropdownMenu');
}

/**
 * 初始化特定的下拉框
 * @param {string} dropdownSelector - 下拉框选择器
 * @param {string} menuId - 下拉菜单ID
 */
function initDropdown(dropdownSelector, menuId) {
    const dropdownSelected = document.querySelector(dropdownSelector);
    const dropdownMenu = document.getElementById(menuId);
    
    if (!dropdownSelected || !dropdownMenu) return;
    
    // 获取下拉框所在的父容器，用于判断是哪种类型的分析
    const isDetailAnalysis = menuId === 'detailFileDropdownMenu';
    
    // 点击下拉框切换显示/隐藏菜单
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = this.closest('.custom-dropdown');
        if (!dropdown) return;
        
        dropdown.classList.toggle('open');
        
        // 如果打开下拉菜单，加载文件选项
        if (dropdown.classList.contains('open')) {
            if (isDetailAnalysis) {
                loadDetailFileDropdownItems();
            } else {
                loadFileDropdownItems();
            }
        }
    });
    
    // 点击页面其他区域关闭下拉菜单
    document.addEventListener('click', function() {
        const dropdown = dropdownSelected.closest('.custom-dropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }
    });
    
    // 阻止点击下拉菜单时关闭
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
        
        // 同时禁用学生选择
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            // 清空学生选项
            while (studentSelect.options.length > 0) {
                studentSelect.remove(0);
            }
            
            const defaultStudentOption = document.createElement('option');
            defaultStudentOption.value = '';
            defaultStudentOption.textContent = '-- 请先选择成绩表 --';
            studentSelect.appendChild(defaultStudentOption);
            
            studentSelect.disabled = true;
        }
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
    
    // 更新学生选择列表
    updateStudentOptions();
}

/**
 * 更新学生选择列表
 */
function updateStudentOptions() {
    const studentSelect = document.getElementById('studentSelect');
    if (!studentSelect) return;
    
    console.log('开始更新学生选择列表...');
    console.log('当前选择的文件ID列表:', selectedFileIds);
    
    // 清空现有选项
    while (studentSelect.options.length > 0) {
        studentSelect.remove(0);
    }
    
    // 如果没有选择文件，禁用学生选择
    if (selectedFileIds.length === 0) {
        console.log('没有选择文件，禁用学生选择下拉框');
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 请先选择成绩表 --';
        studentSelect.appendChild(defaultOption);
        
        studentSelect.disabled = true;
        return;
    }
    
    // 启用学生选择
    studentSelect.disabled = false;
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 请选择学生 --';
    studentSelect.appendChild(defaultOption);
    
    // 收集所有选中文件的数据
    const allFilesData = [];
    selectedFileIds.forEach(fileId => {
        const fileData = getFileById(fileId);
        if (fileData) {
            console.log(`成功获取文件数据, ID: ${fileId}, 名称: ${fileData.name}`);
            console.log('文件数据预览:', fileData.data ? `总行数: ${fileData.data.length}` : '无数据');
            allFilesData.push(fileData);
        } else {
            console.warn(`无法获取文件数据, ID: ${fileId}`);
        }
    });
    
    // 按日期排序
    allFilesData.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    console.log('排序后的文件数据:', allFilesData.map(f => ({id: f.id, name: f.name, date: f.date})));
    
    // 获取所有选中文件中的学生
    console.log('开始从选中文件中获取学生...');
    const students = getAllStudentsFromSelectedFiles(allFilesData);
    console.log(`找到 ${students.length} 名学生:`, students);
    
    // 添加学生选项
    if (students.length > 0) {
        console.log('开始添加学生选项到下拉框');
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
            console.log(`已添加学生: ${student.name}, ID: ${student.id}, 出现在文件: ${student.fileIds.join(', ')}`);
        });
    } else {
        // 如果没有找到学生，禁用下拉框
        console.warn('未找到任何学生数据，禁用学生选择下拉框');
        studentSelect.disabled = true;
        const noStudentOption = document.createElement('option');
        noStudentOption.value = '';
        noStudentOption.textContent = '未找到学生数据';
        studentSelect.appendChild(noStudentOption);
    }
}

/**
 * 从选中的文件中获取所有学生
 * @param {Array} filesData - 所有文件的数据
 * @returns {Array} 学生列表
 */
function getAllStudentsFromSelectedFiles(filesData) {
    console.log('开始查找学生信息列...');
    // 查找包含学生信息的列（通常是第一列或第二列）
    const studentNameColumn = findStudentNameColumn(filesData);
    const studentIdColumn = findStudentIdColumn(filesData);
    
    console.log(`查找结果 - 学生姓名列索引: ${studentNameColumn}, 学生ID列索引: ${studentIdColumn}`);
    
    if (studentNameColumn === -1) {
        console.error('未找到学生姓名列，无法识别学生');
        return [];
    }
    
    // 使用Map存储学生信息，以学生名称为键，避免重复
    // 这样即使没有学号，也能通过名称保持唯一性
    const studentMap = new Map();
    
    filesData.forEach(fileData => {
        console.log(`处理文件: ${fileData.name || 'unnamed'}, ID: ${fileData.id}`);
        
        if (!fileData.data) {
            console.warn(`文件数据为空: ${fileData.id}`);
            return;
        }
        
        console.log(`文件数据行数: ${fileData.data.length}`);
        
        if (fileData.data && fileData.data.length > 1) {
            // 打印表头调试信息
            console.log('表头信息:', fileData.data[0]);
            
            // 跳过表头行
            for (let i = 1; i < fileData.data.length; i++) {
                const row = fileData.data[i];
                if (!row) {
                    console.warn(`第${i}行数据为空`);
                    continue;
                }
                
                if (row && row.length > studentNameColumn) {
                    const studentName = row[studentNameColumn];
                    
                    // 确保学生姓名是有效的
                    if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') {
                        console.warn(`跳过无效学生名称: ${studentName}`);
                        continue;
                    }
                    
                    // 统一使用姓名作为学生的主键
                    // 如果有学号则附加到ID中，否则仅使用姓名
                    let studentId;
                    if (studentIdColumn !== -1 && row.length > studentIdColumn && row[studentIdColumn]) {
                        studentId = `${studentName}_${row[studentIdColumn]}`;
                        console.log(`学生 ${studentName} 有学号，使用组合ID: ${studentId}`);
                    } else {
                        studentId = studentName; // 直接使用姓名作为ID
                        console.log(`学生 ${studentName} 无学号，直接使用姓名作为ID`);
                    }
                    
                    // 使用学生姓名作为唯一键
                    if (!studentMap.has(studentName)) {
                        console.log(`添加新学生: ${studentName}, ID: ${studentId}`);
                        studentMap.set(studentName, { 
                            id: studentId, 
                            name: studentName,
                            fileIds: [fileData.id] // 记录该学生在哪个文件中出现
                        });
                    } else {
                        // 如果学生已存在，添加文件ID到文件列表中
                        console.log(`学生已存在, 更新文件列表: ${studentName}`);
                        const student = studentMap.get(studentName);
                        if (!student.fileIds.includes(fileData.id)) {
                            student.fileIds.push(fileData.id);
                        }
                    }
                } else {
                    console.warn(`行${i}数据不足, 无法获取学生姓名`);
                }
            }
        } else {
            console.warn(`文件${fileData.id}只有表头或无数据`);
        }
    });
    
    console.log(`学生Map大小: ${studentMap.size}`);
    
    // 转换为数组并按中文姓名排序
    const students = Array.from(studentMap.values())
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    console.log('最终学生列表:', students);
    return students;
}

/**
 * 从选中的文件中获取科目列表
 * @returns {Array} 科目列表
 */
function getSubjectsFromSelectedFiles() {
    const subjects = new Set();
    // 定义非科目列的名称列表
    const nonSubjectColumns = ['姓名', '学号', '班级', '序号', 'id', 'name', 'class', 'student', 'student_id', 'studentid'];
    
    // 遍历所有选中的文件
    selectedFileIds.forEach(fileId => {
        const fileData = getFileById(fileId);
        if (fileData && fileData.data && fileData.data.length > 0) {
            // 假设科目是表头（第一行）
            const headers = fileData.data[0];
            
            // 遍历所有列
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                if (header && typeof header === 'string') {
                    // 检查是否是非科目列
                    const isNonSubject = nonSubjectColumns.some(keyword => 
                        header.toLowerCase().includes(keyword.toLowerCase())
                    );
                    
                    // 如果不是非科目列，则添加到科目集合中
                    if (!isNonSubject) {
                        subjects.add(header);
                    }
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
    const studentSelect = document.getElementById('studentSelect');
    if (!generateTrendBtn || !studentSelect) return;
    
    // 当选择了至少一个文件、选择了科目且选择了学生时，启用生成按钮
    generateTrendBtn.disabled = !(
        selectedFileIds.length > 0 && 
        selectedSubject && 
        studentSelect.value
    );
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
 * 显示个人成绩变化趋势分析
 */
function showPersonalTrendAnalysis() {
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    console.log('开始进行个人成绩变化趋势分析...');
    
    // 检查是否选择了文件和科目
    if (selectedFileIds.length === 0 || !selectedSubject) {
        console.warn('未选择成绩表或科目');
        analysisResult.innerHTML = `
            <div class="analysis-info">
                <h3>个人成绩变化趋势分析</h3>
                <p>请选择至少一个成绩表和一个科目</p>
            </div>
        `;
        return;
    }
    
    // 获取选中的学生ID
    const studentSelect = document.getElementById('studentSelect');
    if (!studentSelect || !studentSelect.value) {
        console.warn('未选择学生');
        analysisResult.innerHTML = `
            <div class="analysis-info">
                <h3>个人成绩变化趋势分析</h3>
                <p>请选择一个学生</p>
            </div>
        `;
        return;
    }
    
    const selectedStudentId = studentSelect.value;
    console.log(`选中的学生ID: ${selectedStudentId}`);
    
    // 收集所有选中文件的数据
    const allFilesData = [];
    selectedFileIds.forEach(fileId => {
        const fileData = getFileById(fileId);
        if (fileData) {
            console.log(`成功获取文件数据进行趋势分析, ID: ${fileId}, 名称: ${fileData.name}`);
            allFilesData.push(fileData);
        } else {
            console.warn(`趋势分析无法获取文件数据, ID: ${fileId}`);
        }
    });
    
    // 按日期排序
    allFilesData.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    console.log('趋势分析排序后的文件数据:', allFilesData.map(f => ({id: f.id, name: f.name, date: f.date})));
    
    // 获取所有学生
    console.log('开始为趋势分析重新获取学生列表...');
    const students = getAllStudentsFromSelectedFiles(allFilesData);
    
    // 找到选中的学生
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    console.log('选中的学生信息:', selectedStudent);
    
    if (!selectedStudent) {
        console.error(`未能在学生列表中找到ID为 ${selectedStudentId} 的学生`);
        console.log('可用的学生列表:', students.map(s => ({id: s.id, name: s.name})));
        
        // 检查一下是否学生ID格式有问题
        const studentOption = studentSelect.options[studentSelect.selectedIndex];
        console.log('选中的学生选项:', studentOption ? {
            text: studentOption.textContent,
            value: studentOption.value
        } : '无选中选项');
        
        analysisResult.innerHTML = `
            <div class="analysis-info">
                <h3>个人成绩变化趋势分析</h3>
                <p>未找到选中的学生信息，请重新选择学生</p>
            </div>
        `;
        return;
    }
    
    // 设置分析结果区域的HTML结构
    analysisResult.innerHTML = `
        <div class="analysis-info">
            <h3>个人成绩变化趋势分析</h3>
            <div class="chart-container">
                <canvas id="trendChart"></canvas>
            </div>
        </div>
    `;
    
    // 生成趋势图
    generateTrendChart(selectedStudent, allFilesData);
}

/**
 * 生成趋势图
 * @param {Object} student - 学生对象
 * @param {Array} filesData - 所有文件的数据
 */
function generateTrendChart(student, filesData) {
    console.log('开始生成趋势图，学生:', student.name);
    
    // 获取科目列和学生姓名列的索引
    const studentNameColumn = findStudentNameColumn(filesData);
    console.log(`学生姓名列索引: ${studentNameColumn}`);
    
    if (filesData.length === 0 || !filesData[0].data || !filesData[0].data[0]) {
        console.error('文件数据无效或为空');
        return;
    }
    
    const subjectColumns = getSubjectColumns(filesData[0].data[0]);
    console.log('科目列:', subjectColumns);
    
    // 收集学生在不同文件中的成绩数据
    const scoreData = [];
    
    // 过滤出包含该学生数据的文件
    const relevantFiles = filesData.filter(file => student.fileIds.includes(file.id));
    console.log(`相关文件数量: ${relevantFiles.length}`);
    
    relevantFiles.forEach(fileData => {
        console.log(`处理文件: ${fileData.name}, ID: ${fileData.id}`);
        
        // 查找该学生在当前文件中的行
        let studentRow = null;
        
        if (fileData.data && fileData.data.length > 1) {
            for (let i = 1; i < fileData.data.length; i++) {
                const row = fileData.data[i];
                if (row && row.length > studentNameColumn && 
                    String(row[studentNameColumn]).trim() === student.name.trim()) {
                    studentRow = row;
                    console.log(`在文件 ${fileData.name} 的第 ${i} 行找到学生 ${student.name}`);
                    break;
                }
            }
        }
        
        // 如果没找到学生行，跳过这个文件
        if (!studentRow) {
            console.warn(`在文件 ${fileData.name} 中未找到学生 ${student.name} 的行`);
            return; // 在forEach中相当于continue，跳过当前循环
        }
        
        // 获取该学生的成绩
        console.log(`学生行数据:`, studentRow);
        
        const fileScores = { 
            fileName: fileData.name || '未命名文件',
            date: fileData.date || null,
            scores: {}
        };
        
        if (selectedSubject === 'all') {
            // 如果选择了全部科目，收集所有科目的成绩
            subjectColumns.forEach(column => {
                if (studentRow.length > column.index) {
                    const score = parseFloat(studentRow[column.index]);
                    if (!isNaN(score)) {
                        fileScores.scores[column.name] = score;
                        console.log(`科目 ${column.name}: ${score}`);
                    }
                }
            });
        } else {
            // 收集特定科目的成绩
            const subjectColumn = subjectColumns.find(column => column.name === selectedSubject);
            if (subjectColumn && studentRow.length > subjectColumn.index) {
                const score = parseFloat(studentRow[subjectColumn.index]);
                if (!isNaN(score)) {
                    fileScores.scores[selectedSubject] = score;
                    console.log(`科目 ${selectedSubject}: ${score}`);
                }
            } else {
                console.warn(`未找到科目 ${selectedSubject} 的成绩数据`);
            }
        }
        
        scoreData.push(fileScores);
    });
    
    console.log('收集到的成绩数据:', scoreData);
    
    // 如果没有收集到数据，显示提示信息
    if (scoreData.length === 0) {
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>未找到该学生在选定科目的成绩数据，请选择其他科目或学生</p>
                </div>
            `;
        }
        return;
    }
    
    // 开始绘制图表
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.error('未找到图表画布元素');
        return;
    }
    
    // 如果已经存在图表，销毁它
    try {
        if (window.trendChart instanceof Chart) {
            console.log('销毁旧图表');
            window.trendChart.destroy();
        }
    } catch (error) {
        console.error('销毁旧图表时出错:', error);
    }
    
    // 准备图表数据
    const labels = scoreData.map(data => data.fileName);
    const datasets = [];
    
    // 马卡龙色系的颜色
    const colors = [
        'rgba(255, 159, 64, 1)',    // 橙色
        'rgba(75, 192, 192, 1)',    // 蓝绿色
        'rgba(255, 99, 132, 1)',    // 粉红色
        'rgba(54, 162, 235, 1)',    // 蓝色
        'rgba(153, 102, 255, 1)',   // 紫色
        'rgba(255, 205, 86, 1)',    // 黄色
        'rgba(201, 203, 207, 1)',   // 灰色
        'rgba(255, 127, 80, 1)',    // 珊瑚色
        'rgba(100, 149, 237, 1)',   // 矢车菊蓝
        'rgba(189, 252, 201, 1)'    // 薄荷色
    ];
    
    if (selectedSubject === 'all') {
        // 如果选择了全部科目，为每个科目创建一个数据集
        const subjectNames = subjectColumns.map(column => column.name);
        
        subjectNames.forEach((subject, index) => {
            const data = scoreData.map(fileScore => fileScore.scores[subject] || null);
            
            // 如果所有成绩都是null，跳过这个科目
            if (data.every(score => score === null)) {
                console.log(`科目 ${subject} 所有成绩都为空，跳过`);
                return;
            }
            
            console.log(`添加科目 ${subject} 的数据集:`, data);
            datasets.push({
                label: subject,
                data: data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
                fill: false,
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'white',
                pointBorderColor: colors[index % colors.length],
                pointBorderWidth: 2
            });
        });
    } else {
        // 只显示选定科目
        const data = scoreData.map(fileScore => fileScore.scores[selectedSubject] || null);
        
        console.log(`添加科目 ${selectedSubject} 的数据集:`, data);
        datasets.push({
            label: selectedSubject,
            data: data,
            borderColor: colors[0],
            backgroundColor: colors[0].replace('1)', '0.2)'),
            fill: false,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'white',
            pointBorderColor: colors[0],
            pointBorderWidth: 2
        });
    }
    
    // 如果没有有效的数据集，显示提示信息
    if (datasets.length === 0) {
        console.warn('没有有效的数据集');
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>未找到该学生在选定科目的有效成绩数据，请选择其他科目或学生</p>
                </div>
            `;
        }
        return;
    }
    
    console.log('创建图表，标签:', labels);
    console.log('数据集数量:', datasets.length);
    
    try {
        // 创建图表
        window.trendChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${student.name} - 成绩变化趋势图`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    datalabels: {
                        display: function(context) {
                            return context.dataset.data[context.dataIndex] !== null;
                        },
                        backgroundColor: function(context) {
                            return context.dataset.borderColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        padding: 4,
                        formatter: function(value) {
                            return value !== null ? value : '';
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 0,
                        suggestedMax: 100,
                        title: {
                            display: true,
                            text: '分数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '考试'
                        }
                    }
                }
            }
        });
        
        console.log('趋势图已生成');
    } catch (error) {
        console.error('创建图表时出错:', error);
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>生成图表时发生错误，请刷新页面后重试</p>
                    <p class="error-details">错误详情: ${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * 获取所有科目列
 * @param {Array} headers - 表头行
 * @returns {Array} 科目列数组
 */
function getSubjectColumns(headers) {
    if (!headers || !Array.isArray(headers)) {
        return [];
    }
    
    const nonSubjectColumns = ['姓名', '学号', '班级', '序号', 'id', 'name', 'class', 'student', 'student_id', 'studentid'];
    const subjectColumns = [];
    
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header && typeof header === 'string') {
            // 检查是否是非科目列
            const isNonSubject = nonSubjectColumns.some(keyword => 
                header.toLowerCase().includes(keyword.toLowerCase())
            );
            
            // 如果不是非科目列，则添加到科目集合中
            if (!isNonSubject) {
                subjectColumns.push({
                    name: header,
                    index: i
                });
            }
        }
    }
    
    return subjectColumns;
}

/**
 * 清空分析结果区域
 */
function clearAnalysisResult() {
    const analysisResult = document.getElementById('analysisResult');
    if (analysisResult) {
        const selectedValue = document.getElementById('analysisTypeSelect')?.value;
        
        if (selectedValue === 'personal-detail') {
            analysisResult.innerHTML = `
                <div class="empty-analysis">
                    <p>个人成绩详情分析</p>
                    <ol class="analysis-steps">
                        <li>请先从下拉框中选择一个成绩表</li>
                        <li>然后选择要分析的学生</li>
                        <li>选择要分析的科目（可选所有科目）</li>
                        <li>点击"生成详情图"按钮查看分析结果</li>
                    </ol>
                </div>
            `;
        } else if (selectedValue === 'personal-trend') {
            analysisResult.innerHTML = `
                <div class="empty-analysis">
                    <p>个人成绩趋势分析</p>
                    <ol class="analysis-steps">
                        <li>请先从下拉框中选择多个成绩表</li>
                        <li>然后选择要分析的科目</li>
                        <li>选择要分析的学生</li>
                        <li>点击"生成趋势图"按钮查看分析结果</li>
                    </ol>
                </div>
            `;
        } else {
            analysisResult.innerHTML = `
                <div class="empty-analysis">
                    <p>请选择分析类型</p>
                </div>
            `;
        }
    }
}

/**
 * 查找学生姓名列的索引
 * @param {Array} filesData - 所有文件的数据
 * @returns {number} 列索引，若未找到则返回-1
 */
function findStudentNameColumn(filesData) {
    const nameKeywords = ['姓名', '学生', 'name', 'student'];
    console.log('开始查找学生姓名列, 关键词:', nameKeywords);
    
    for (const fileData of filesData) {
        console.log(`检查文件 ${fileData.id} 的表头`);
        
        if (!fileData.data || !fileData.data.length) {
            console.warn(`文件 ${fileData.id} 无数据`);
            continue;
        }
        
        const headers = fileData.data[0];
        console.log('表头数据:', headers);
        
        // 尝试查找包含关键词的列
        for (let i = 0; i < headers.length; i++) {
            const header = String(headers[i] || '').toLowerCase();
            console.log(`检查列 ${i}: ${header}`);
            
            if (nameKeywords.some(keyword => header.includes(keyword.toLowerCase()))) {
                console.log(`找到学生姓名列: ${i}, 列名: ${headers[i]}`);
                return i;
            }
        }
        
        // 如果没有找到，默认使用第一列
        console.log('未找到匹配的学生姓名列，默认使用第一列 (0)');
        return 0;
    }
    
    console.error('未找到任何文件的表头数据，无法确定学生姓名列');
    return -1;
}

/**
 * 查找学生ID列的索引
 * @param {Array} filesData - 所有文件的数据
 * @returns {number} 列索引，若未找到则返回-1
 */
function findStudentIdColumn(filesData) {
    const idKeywords = ['学号', 'id', '编号', 'student_id', 'studentid'];
    console.log('开始查找学生ID列, 关键词:', idKeywords);
    
    for (const fileData of filesData) {
        console.log(`检查文件 ${fileData.id} 的表头`);
        
        if (!fileData.data || !fileData.data.length) {
            console.warn(`文件 ${fileData.id} 无数据`);
            continue;
        }
        
        const headers = fileData.data[0];
        
        // 尝试查找包含关键词的列
        for (let i = 0; i < headers.length; i++) {
            const header = String(headers[i] || '').toLowerCase();
            console.log(`检查列 ${i}: ${header}`);
            
            if (idKeywords.some(keyword => header.includes(keyword.toLowerCase()))) {
                console.log(`找到学生ID列: ${i}, 列名: ${headers[i]}`);
                return i;
            }
        }
    }
    
    console.log('未找到学生ID列');
    return -1;
}

/**
 * 查找班级列的索引
 * @param {Array} filesData - 所有文件的数据
 * @returns {number} 列索引，若未找到则返回-1
 */
function findClassColumn(filesData) {
    const classKeywords = ['班级', '班号', 'class'];
    console.log('开始查找班级列, 关键词:', classKeywords);
    
    for (const fileData of filesData) {
        console.log(`检查文件 ${fileData.id} 的表头`);
        
        if (!fileData.data || !fileData.data.length) {
            console.warn(`文件 ${fileData.id} 无数据`);
            continue;
        }
        
        const headers = fileData.data[0];
        
        // 尝试查找包含关键词的列
        for (let i = 0; i < headers.length; i++) {
            const header = String(headers[i] || '').toLowerCase();
            console.log(`检查列 ${i}: ${header}`);
            
            if (classKeywords.some(keyword => header.includes(keyword.toLowerCase()))) {
                console.log(`找到班级列: ${i}, 列名: ${headers[i]}`);
                return i;
            }
        }
    }
    
    console.log('未找到班级列');
    return -1;
}

/**
 * 获取文件中的班级信息
 * @param {Object} fileData - 文件数据
 * @returns {string} 班级名称，若未找到则返回undefined
 */
function getClassNameFromFile(fileData) {
    // 如果文件已经有记录的班级信息，直接返回
    if (fileData.class) {
        return fileData.class;
    }
    
    // 如果新格式数据已经有班级信息，直接返回
    if (fileData.data && fileData.data.className) {
        return fileData.data.className;
    }
    
    // 从表头中查找班级列
    if (Array.isArray(fileData.data) && fileData.data.length > 0) {
        const classColumnIndex = findClassColumn([fileData]);
        if (classColumnIndex !== -1 && fileData.data.length > 1) {
            // 获取第一个学生的班级作为整个文件的班级
            const firstStudentRow = fileData.data[1];
            if (firstStudentRow && firstStudentRow.length > classColumnIndex) {
                return firstStudentRow[classColumnIndex];
            }
        }
    }
    
    return undefined;
}

/**
 * 显示详情分析选项
 */
function showDetailAnalysisOptions() {
    const detailOptions = document.getElementById('detailAnalysisOptions');
    if (detailOptions) {
        detailOptions.style.display = 'block';
        
        // 加载所有文件
        loadAllFiles();
        
        // 清空已选文件和学生、科目下拉框
        selectedFileIds = [];
        
        // 更新文件列表和学生选择器
        updateDetailSelectedFilesList();
        updateDetailStudentOptions();
        updateDetailSubjectOptions();
        
        // 清空分析结果区域
        clearAnalysisResult();
    }
}

/**
 * 隐藏详情分析选项
 */
function hideDetailAnalysisOptions() {
    const detailOptions = document.getElementById('detailAnalysisOptions');
    if (detailOptions) {
        detailOptions.style.display = 'none';
    }
    
    // 重置下拉框文本
    const selectedText = document.querySelector('.detail-selected-text');
    if (selectedText) {
        selectedText.textContent = '-- 请选择成绩表 --';
    }
    
    // 重置选择状态 (保持与趋势分析共享的状态)
    selectedFileIds = [];
    updateDetailSelectedFilesList();
}

/**
 * 加载详情分析的文件下拉选项
 */
function loadDetailFileDropdownItems() {
    const dropdownMenu = document.getElementById('detailFileDropdownMenu');
    if (!dropdownMenu) return;
    
    // 清空现有选项
    dropdownMenu.innerHTML = '';
    
    // 如果没有文件，显示提示
    if (allFilesCache.length === 0) {
        dropdownMenu.innerHTML = '<div class="dropdown-item no-files">暂无数据文件</div>';
        return;
    }
    
    // 添加文件选项
    allFilesCache.forEach(file => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');
        
        // 如果文件已被选择，添加选中样式
        if (selectedFileIds.includes(file.id)) {
            item.classList.add('selected');
        }
        
        const dateStr = file.date ? new Date(file.date).toLocaleDateString() : '无日期';
        
        item.innerHTML = `
            <div class="checkbox-indicator"></div>
            <div class="dropdown-item-text">
                <strong>${file.name || '未命名文件'}</strong>
                <div>${dateStr} - ${file.className || '未知班级'}</div>
            </div>
        `;
        
        // 点击选择文件
        item.addEventListener('click', function() {
            console.log('选择文件:', file.id, file.name);
            
            // 清除所有其他选择
            dropdownMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('selected'));
            
            // 添加选中状态
            this.classList.add('selected');
            
            // 保存已选择的文件
            selectedFileIds = [file.id];
            
            // 更新下拉框显示文本
            const selectedText = document.querySelector('.detail-selected-text');
            if (selectedText) {
                selectedText.textContent = file.name || '未命名文件';
            }
            
            // 更新已选文件列表显示
            updateDetailSelectedFilesList();
            
            // 载入并更新学生和科目选择
            console.log('更新学生和科目选择');
            
            setTimeout(() => {
                // 确保选择的文件中有学生数据
                const selectedFile = getFileById(file.id);
                if (selectedFile && selectedFile.data) {
                    console.log('获取到文件数据，准备更新学生选择');
                    updateDetailStudentOptions();
                    updateDetailSubjectOptions();
                }
            }, 0);
        });
        
        dropdownMenu.appendChild(item);
    });
}

/**
 * 更新详情分析的已选择文件列表
 */
function updateDetailSelectedFilesList() {
    const selectedFilesList = document.getElementById('detailSelectedFilesList');
    const selectedText = document.querySelector('.detail-selected-text');
    
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
    
    // 获取选中的文件
    const selectedFile = allFilesCache.find(f => f.id === selectedFileIds[0]);
    if (!selectedFile) {
        selectedFilesList.innerHTML = '<div class="empty-selected">未找到选中的成绩表</div>';
        return;
    }
    
    // 更新下拉框显示文本
    if (selectedText) {
        selectedText.textContent = selectedFile.name || '未命名文件';
    }
    
    // 显示文件信息
    selectedFilesList.innerHTML = `
        <div class="selected-file-info">
            <p>${selectedFile.name || '未命名文件'}</p>
            <p>日期: ${selectedFile.date ? new Date(selectedFile.date).toLocaleDateString('zh-CN') : '无日期'}</p>
            <p>班级: ${selectedFile.class || '未指定班级'}</p>
        </div>
    `;
}

/**
 * 更新详情分析的学生选择列表
 */
function updateDetailStudentOptions() {
    const studentSelect = document.getElementById('detailStudentSelect');
    if (!studentSelect) return;
    
    console.log('开始更新详情分析的学生选择列表...');
    
    // 清空现有选项
    while (studentSelect.options.length > 0) {
        studentSelect.remove(0);
    }
    
    // 如果没有选择文件，禁用学生选择
    if (selectedFileIds.length === 0) {
        console.log('没有选择文件，禁用学生选择下拉框');
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 请先选择成绩表 --';
        studentSelect.appendChild(defaultOption);
        
        studentSelect.disabled = true;
        
        // 同时禁用科目选择
        const subjectSelect = document.getElementById('detailSubjectSelect');
        if (subjectSelect) {
            subjectSelect.disabled = true;
            while (subjectSelect.options.length > 0) {
                subjectSelect.remove(0);
            }
            const defaultSubjectOption = document.createElement('option');
            defaultSubjectOption.value = '';
            defaultSubjectOption.textContent = '-- 请先选择成绩表 --';
            subjectSelect.appendChild(defaultSubjectOption);
        }
        return;
    }
    
    // 启用学生选择
    studentSelect.disabled = false;
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 请选择学生 --';
    studentSelect.appendChild(defaultOption);
    
    // 收集选中文件的数据
    const fileData = getFileById(selectedFileIds[0]);
    
    if (!fileData) {
        console.warn(`无法获取文件数据, ID: ${selectedFileIds[0]}`);
        studentSelect.disabled = true;
        return;
    }
    
    console.log(`成功获取文件数据, ID: ${fileData.id}, 名称: ${fileData.name}`);
    
    // 获取所有学生
    console.log('开始从文件中获取学生...');
    const students = getAllStudentsFromSelectedFiles([fileData]);
    console.log(`找到 ${students.length} 名学生:`, students);
    
    // 添加学生选项
    if (students.length > 0) {
        console.log('开始添加学生选项到下拉框');
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
            console.log(`已添加学生: ${student.name}, ID: ${student.id}`);
        });
        
        // 更新科目选择
        updateDetailSubjectOptions();
    } else {
        // 如果没有找到学生，禁用下拉框
        console.warn('未找到任何学生数据，禁用学生选择下拉框');
        studentSelect.disabled = true;
        const noStudentOption = document.createElement('option');
        noStudentOption.value = '';
        noStudentOption.textContent = '未找到学生数据';
        studentSelect.appendChild(noStudentOption);
    }
    
    // 更新生成按钮状态
    updateGenerateDetailButtonState();
}

/**
 * 更新详情分析的科目选择列表
 */
function updateDetailSubjectOptions() {
    const subjectSelect = document.getElementById('detailSubjectSelect');
    if (!subjectSelect) return;
    
    console.log('开始更新详情分析的科目选择列表...');
    
    // 清空现有选项
    while (subjectSelect.options.length > 0) {
        subjectSelect.remove(0);
    }
    
    // 如果没有选择文件，禁用科目选择
    if (selectedFileIds.length === 0) {
        console.log('没有选择文件，禁用科目选择下拉框');
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
    
    // 添加全部科目选项
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '全部科目';
    subjectSelect.appendChild(allOption);
    
    // 收集选中文件的数据
    const fileData = getFileById(selectedFileIds[0]);
    
    if (!fileData) {
        console.warn(`无法获取文件数据, ID: ${selectedFileIds[0]}`);
        subjectSelect.disabled = true;
        return;
    }
    
    // 获取所有科目
    const subjects = getSubjectsFromFile(fileData);
    
    // 添加科目选项
    if (subjects.length > 0) {
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    } else {
        // 如果没有找到科目，禁用下拉框
        subjectSelect.disabled = true;
        const noSubjectOption = document.createElement('option');
        noSubjectOption.value = '';
        noSubjectOption.textContent = '未找到科目数据';
        subjectSelect.appendChild(noSubjectOption);
    }
    
    // 更新生成按钮状态
    updateGenerateDetailButtonState();
}

/**
 * 从文件中获取科目列表
 * @param {Object} fileData - 文件数据
 * @returns {Array} 科目列表
 */
function getSubjectsFromFile(fileData) {
    console.log('开始提取科目列表，文件数据:', fileData);
    
    if (!fileData || !fileData.data) {
        console.error('文件数据为空或格式不正确');
        return [];
    }
    
    // 检查文件数据格式，看是否使用新格式（含students数组）
    if (fileData.data.students && Array.isArray(fileData.data.students) && fileData.data.students.length > 0) {
        console.log('使用新数据格式提取科目');
        // 新格式：从第一个学生的scores对象中获取科目
        const firstStudent = fileData.data.students[0];
        if (!firstStudent.scores) {
            console.error('学生数据中没有成绩信息');
            return [];
        }
        
        const subjects = Object.keys(firstStudent.scores);
        console.log('从学生scores对象中提取的科目:', subjects);
        return subjects;
    }
    // 检查是否有rawData字段（转换后的旧数据）
    else if (fileData.data.rawData && Array.isArray(fileData.data.rawData) && fileData.data.rawData.length > 0) {
        console.log('使用转换后的旧数据格式（rawData）提取科目');
        // 旧格式：从表头（第一行）中提取科目
        const headers = fileData.data.rawData[0];
        const nonSubjectColumns = ['姓名', '学号', '班级', '序号', 'id', 'name', 'class', 'student', 'student_id', 'studentid'];
        
        // 找出所有不是学生信息的列
        const subjects = [];
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header && typeof header === 'string') {
                // 检查是否是非科目列
                const isNonSubject = nonSubjectColumns.some(keyword => 
                    header.toLowerCase().includes(keyword.toLowerCase())
                );
                
                // 如果不是非科目列，则添加到科目集合中
                if (!isNonSubject) {
                    subjects.push(header);
                }
            }
        }
        
        console.log('从表头提取的科目:', subjects);
        return subjects;
    }
    // 原始的旧格式数据（二维数组）
    else if (Array.isArray(fileData.data) && fileData.data.length > 0) {
        console.log('使用旧数据格式（二维数组）提取科目');
        // 旧格式：从表头（第一行）中提取科目
        const headers = fileData.data[0];
        const nonSubjectColumns = ['姓名', '学号', '班级', '序号', 'id', 'name', 'class', 'student', 'student_id', 'studentid'];
        
        // 找出所有不是学生信息的列
        const subjects = [];
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header && typeof header === 'string') {
                // 检查是否是非科目列
                const isNonSubject = nonSubjectColumns.some(keyword => 
                    header.toLowerCase().includes(keyword.toLowerCase())
                );
                
                // 如果不是非科目列，则添加到科目集合中
                if (!isNonSubject) {
                    subjects.push(header);
                }
            }
        }
        
        console.log('从表头提取的科目:', subjects);
        return subjects;
    }
    
    console.error('无法从文件中提取科目列表');
    return [];
}

/**
 * 更新生成详情图按钮状态
 */
function updateGenerateDetailButtonState() {
    const generateDetailBtn = document.getElementById('generateDetailBtn');
    const detailStudentSelect = document.getElementById('detailStudentSelect');
    
    if (!generateDetailBtn || !detailStudentSelect) return;
    
    const hasSelectedStudent = detailStudentSelect.value !== '';
    const hasSelectedFile = selectedFileIds.length > 0;
    
    generateDetailBtn.disabled = !(hasSelectedStudent && hasSelectedFile);
}

/**
 * 执行详情分析
 */
function performDetailAnalysis() {
    try {
        console.log('开始执行详情分析...');
        
        // 获取选择的学生
        const studentSelect = document.getElementById('detailStudentSelect');
        if (!studentSelect || !studentSelect.value) {
            showToast('请选择学生', 'error');
            console.error('未选择学生');
            return;
        }
        const selectedStudent = studentSelect.value;
        console.log('选择的学生ID:', selectedStudent);
        
        // 获取选择的文件
        if (selectedFileIds.length === 0) {
            showToast('请选择成绩表', 'error');
            console.error('未选择成绩表');
            return;
        }
        const detailFileId = selectedFileIds[0];
        console.log('选择的文件ID:', detailFileId);
        
        // 检查学生下拉框是否有内容
        if (studentSelect.options.length <= 1) {
            showToast('请先选择包含学生数据的成绩表', 'error');
            console.error('学生下拉框没有选项');
            return;
        }
        
        // 获取选择的科目
        const subjectSelect = document.getElementById('detailSubjectSelect');
        const selectedSubject = subjectSelect ? subjectSelect.value : 'all';
        console.log('选择的科目:', selectedSubject);
        
        // 获取文件数据
        const fileData = getFileById(detailFileId);
        if (!fileData) {
            showToast('无法获取文件数据', 'error');
            console.error('无法获取文件数据, ID:', detailFileId);
            return;
        }
        
        console.log('获取到的文件数据:', fileData);
        
        // 检查文件数据格式
        if (!fileData.data) {
            showToast('文件数据不完整', 'error');
            console.error('文件数据不含data字段');
            return;
        }
        
        // 获取班级信息
        const className = getClassNameFromFile(fileData);
        console.log('获取到的班级信息:', className);
        
        // 确保fileData.data有正确的结构
        if (!fileData.data.students && !fileData.data.className) {
            // 如果是旧结构（二维数组），转换为新结构
            if (Array.isArray(fileData.data)) {
                const rawData = [...fileData.data];
                fileData.data = {
                    rawData: rawData,
                    className: className || '未知班级'
                };
            } else {
                // 确保至少有className字段
                fileData.data.className = className || '未知班级';
            }
        } else if (!fileData.data.className) {
            fileData.data.className = className || '未知班级';
        }
        
        // 根据文件数据格式处理
        let studentsData = [];
        let studentData = null;
        
        // 处理新格式数据
        if (fileData.data.students && Array.isArray(fileData.data.students)) {
            console.log('使用新格式数据处理');
            studentsData = fileData.data.students;
            studentData = studentsData.find(student => student.id === selectedStudent);
        } 
        // 处理旧格式数据（二维数组）
        else if (fileData.data.rawData && Array.isArray(fileData.data.rawData) && fileData.data.rawData.length > 1) {
            console.log('使用旧格式数据处理（二维数组）');
            
            // 查找学生姓名列和ID列
            const headers = fileData.data.rawData[0];
            const studentNameColumnIndex = findStudentNameColumn([{ id: fileData.id, data: fileData.data.rawData }]);
            const studentIdColumn = findStudentIdColumn([{ id: fileData.id, data: fileData.data.rawData }]);
            
            if (studentNameColumnIndex === -1) {
                showToast('无法识别学生信息列', 'error');
                console.error('无法识别学生信息列');
                return;
            }
            
            // 找到学生行
            let studentRowFound = false;
            let studentRow = null;
            
            console.log('开始查找学生行，选择的学生ID:', selectedStudent);
            console.log('按以下条件查找学生行：');
            console.log('- 学生姓名列索引:', studentNameColumnIndex);
            console.log('- 学生ID列索引:', studentIdColumn);
            
            // 遍历所有行进行查找
            for (let i = 1; i < fileData.data.rawData.length; i++) {
                const row = fileData.data.rawData[i];
                if (!row || !row[studentNameColumnIndex]) continue;
                
                const rowStudentName = row[studentNameColumnIndex];
                const rowStudentId = studentIdColumn !== -1 && row.length > studentIdColumn ? 
                    `${rowStudentName}_${row[studentIdColumn]}` : rowStudentName;
                
                console.log(`行 ${i} - 学生: ${rowStudentName}, ID: ${rowStudentId}`);
                
                // 检查是否匹配所选学生ID
                if (rowStudentId === selectedStudent || rowStudentName === selectedStudent) {
                    console.log('找到匹配的学生行!');
                    studentRow = row;
                    studentRowFound = true;
                    break;
                }
            }
            
            if (!studentRowFound) {
                showToast('找不到所选学生数据，请检查学生选择', 'error');
                console.error('找不到所选学生行，选择的学生ID:', selectedStudent);
                return;
            }
            
            console.log('找到的学生行数据:', studentRow);
            
            // 从行数据生成学生对象
            studentData = {
                id: selectedStudent,
                name: studentRow[studentNameColumnIndex],
                scores: {}
            };
            
            // 获取科目列信息
            const subjectColumns = getSubjectColumns(headers);
            subjectColumns.forEach(column => {
                const score = parseFloat(studentRow[column.index]);
                if (!isNaN(score)) {
                    studentData.scores[column.name] = score;
                }
            });
            
            // 将所有学生数据转换为新格式
            studentsData = [];
            for (let i = 1; i < fileData.data.rawData.length; i++) {
                const row = fileData.data.rawData[i];
                if (row && row.length > studentNameColumnIndex) {
                    const rowStudentName = row[studentNameColumnIndex];
                    const rowStudentId = studentIdColumn !== -1 && row.length > studentIdColumn ? 
                        `${rowStudentName}_${row[studentIdColumn]}` : rowStudentName;
                    
                    const student = {
                        id: rowStudentId,
                        name: rowStudentName,
                        scores: {}
                    };
                    
                    subjectColumns.forEach(column => {
                        if (row.length > column.index) {
                            const score = parseFloat(row[column.index]);
                            if (!isNaN(score)) {
                                student.scores[column.name] = score;
                            }
                        }
                    });
                    
                    studentsData.push(student);
                }
            }
        }
        
        if (!studentData) {
            showToast('找不到所选学生数据', 'error');
            console.error('找不到所选学生数据');
            return;
        }
        
        console.log('处理后的学生数据:', studentData);
        console.log('处理后的所有学生数据量:', studentsData.length);
        
        // 保存回文件数据中以便后续使用
        if (!fileData.data.students) {
            fileData.data.students = studentsData;
        }
        
        // 获取科目列表
        let subjects = getSubjectsFromFile(fileData);
        if (!subjects.length) {
            showToast('文件中无科目数据', 'error');
            console.error('未找到任何科目');
            return;
        }
        
        console.log('获取到的所有科目:', subjects);
        
        // 如果选择了特定科目，则过滤科目列表
        if (selectedSubject !== 'all' && selectedSubject !== '') {
            subjects = subjects.filter(subject => subject === selectedSubject);
            console.log('过滤后的科目:', subjects);
        }
        
        // 检查是否有可用科目
        if (subjects.length === 0) {
            showToast('选择的科目不可用', 'error');
            console.error('过滤后没有可用科目');
            return;
        }
        
        // 生成个人详情分析
        console.log('开始生成个人详情分析...');
        generateDetailAnalysisResult(studentData, subjects, fileData);
        
    } catch (error) {
        console.error('执行详情分析时出错:', error);
        showToast('分析过程中发生错误: ' + error.message, 'error');
    }
}

/**
 * 生成详情分析结果
 */
function generateDetailAnalysisResult(studentData, subjects, fileData) {
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    console.log('生成详情分析结果:', studentData, subjects);
    
    // 计算班级平均分和最高分
    const classAvgScores = calculateClassAverageScores(fileData.data.students, subjects);
    const maxScores = calculateMaxScores(fileData.data.students, subjects);
    
    // 获取学生ID
    const studentId = studentData.id || '未知';
    
    // 判断是否为单科模式
    const selectedSubject = document.getElementById('detailSubjectSelect').value;
    const isSingleSubjectMode = selectedSubject !== 'all';
    
    // 如果是单科模式，限制subjects只包含选中的科目
    const displaySubjects = isSingleSubjectMode ? [selectedSubject] : subjects;
    
    // 设置单科/全部科目模式的HTML类名标识
    const modeClass = isSingleSubjectMode ? 'single-subject-mode' : 'all-subjects-mode';
    
    // 雷达图提示文字
    const radarChartNote = isSingleSubjectMode ? 
        '<div class="chart-note">注意：选择全部科目时才会显示成绩雷达图</div>' : '';
    
    analysisResult.innerHTML = `
        <h3 class="detail-title">${studentData.name} - 成绩详情分析</h3>
        <div class="detail-analysis-container ${modeClass}">
            <div class="detail-summary">
                <div class="student-info">
                    <p><strong>学号:</strong> ${studentId}</p>
                    <p><strong>班级:</strong> ${fileData.data.className || '未知班级'}</p>
                    <p><strong>考试:</strong> ${fileData.name}</p>
                </div>
                <div class="score-summary">
                    <p><strong>总分:</strong> ${calculateTotalScore(studentData, subjects)}</p>
                    <p><strong>平均分:</strong> ${(calculateTotalScore(studentData, subjects) / subjects.length).toFixed(2)}</p>
                    <p><strong>班级排名:</strong> ${calculateRanking(studentData, fileData.data.students, subjects)}</p>
                </div>
            </div>
            <div class="subjects-detail">
                <h4>各科成绩详情</h4>
                <div class="subject-cards">
                    ${generateSubjectCards(studentData, displaySubjects, classAvgScores, maxScores, fileData.data.students)}
                </div>
            </div>
            <div id="detailChartsContainer" class="detail-charts-container">
                ${!isSingleSubjectMode ? `
                <div id="radarChartContainer" class="chart-container">
                    <h4>成绩雷达图</h4>
                    <canvas id="radarChart"></canvas>
                </div>
                ` : radarChartNote}
                <div id="barChartContainer" class="chart-container">
                    <h4>与班级平均分对比</h4>
                    <canvas id="barChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // 渲染图表
    setTimeout(() => {
        // 仅在全部科目模式下渲染雷达图
        if (!isSingleSubjectMode) {
            renderRadarChart(studentData, subjects, classAvgScores, maxScores);
        }
        renderBarChart(studentData, displaySubjects, classAvgScores);
    }, 100);
}

/**
 * 生成科目卡片HTML
 */
function generateSubjectCards(studentData, subjects, classAvgScores, maxScores, allStudents) {
    return subjects.map(subject => {
        const score = studentData.scores[subject] || 0;
        const classAvg = classAvgScores[subject] || 0;
        const maxScore = maxScores[subject] || 0;
        const ranking = calculateSubjectRanking(studentData.id, subject, allStudents);
        
        // 计算分数与平均分的差距
        const diffFromAvg = score - classAvg;
        const diffClass = diffFromAvg >= 0 ? 'positive-diff' : 'negative-diff';
        
        return `
            <div class="subject-card">
                <h5>${subject}</h5>
                <div class="score-info">
                    <p class="main-score">${score}</p>
                    <p class="score-diff ${diffClass}">
                        ${diffFromAvg >= 0 ? '+' : ''}${diffFromAvg.toFixed(2)}
                    </p>
                </div>
                <div class="score-stats">
                    <p><span>班级平均:</span> <span>${classAvg.toFixed(2)}</span></p>
                    <p><span>最高分:</span> <span>${maxScore}</span></p>
                    <p><span>排名:</span> <span>${ranking}/${allStudents.length}</span></p>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 计算某科目的排名
 */
function calculateSubjectRanking(studentId, subject, allStudents) {
    // 按分数排序（从高到低）
    const sortedStudents = [...allStudents].sort((a, b) => {
        const scoreA = a.scores[subject] || 0;
        const scoreB = b.scores[subject] || 0;
        return scoreB - scoreA;
    });
    
    // 查找学生的排名位置
    const position = sortedStudents.findIndex(student => student.id === studentId);
    return position === -1 ? 'N/A' : position + 1;
}

/**
 * 渲染雷达图
 */
function renderRadarChart(studentData, subjects, classAvgScores, maxScores) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 准备数据
    const studentScores = subjects.map(subject => studentData.scores[subject] || 0);
    const classAvgScoresList = subjects.map(subject => classAvgScores[subject] || 0);
    const maxScoresList = subjects.map(subject => maxScores[subject] || 100);
    
    // 计算分数转换为百分比（相对于每科满分）并保留一位小数
    const studentScoresPercentage = studentScores.map((score, index) => 
        parseFloat(((score / maxScoresList[index]) * 100).toFixed(1)));
    const classAvgScoresPercentage = classAvgScoresList.map((score, index) => 
        parseFloat(((score / maxScoresList[index]) * 100).toFixed(1)));
    
    // 检查各科数据是否重叠，生成标签偏移配置
    const offsetConfigs = generateOffsetConfigs(studentScoresPercentage, classAvgScoresPercentage, subjects);
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: subjects,
            datasets: [
                {
                    label: '个人成绩',
                    data: studentScoresPercentage,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                },
                {
                    label: '班级平均',
                    data: classAvgScoresPercentage,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 2
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: false // 不显示数据标签
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 生成雷达图标签偏移配置，避免数字重叠
 * @param {Array} studentScores 学生成绩数组
 * @param {Array} classScores 班级平均成绩数组
 * @param {Array} subjects 科目数组
 * @returns {Object} 包含学生和班级标签偏移配置的对象
 */
function generateOffsetConfigs(studentScores, classScores, subjects) {
    const offsetThreshold = 5; // 分数差小于这个值时进行偏移
    const offsetValue = 12; // 偏移像素值
    
    const offsetConfigs = {
        student: {},
        class: {}
    };
    
    for (let i = 0; i < subjects.length; i++) {
        const studentScore = studentScores[i];
        const classScore = classScores[i];
        
        // 检查两个数值是否接近
        if (Math.abs(studentScore - classScore) < offsetThreshold) {
            // 如果学生分数大于等于班级平均分，向外偏移学生分数
            if (studentScore >= classScore) {
                offsetConfigs.student[i] = offsetValue;
                offsetConfigs.class[i] = -offsetValue;
            } else {
                // 否则向外偏移班级平均分
                offsetConfigs.student[i] = -offsetValue;
                offsetConfigs.class[i] = offsetValue;
            }
        }
    }
    
    return offsetConfigs;
}

/**
 * 渲染柱状图
 */
function renderBarChart(studentData, subjects, classAvgScores) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 准备数据
    const studentScores = subjects.map(subject => studentData.scores[subject] || 0);
    const classAvgScoresList = subjects.map(subject => classAvgScores[subject] || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [
                {
                    label: '个人成绩',
                    data: studentScores,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '班级平均',
                    data: classAvgScoresList,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 计算学生总分
 */
function calculateTotalScore(studentData, subjects) {
    return subjects.reduce((total, subject) => {
        return total + (studentData.scores[subject] || 0);
    }, 0);
}

/**
 * 计算学生排名
 */
function calculateRanking(studentData, allStudents, subjects) {
    // 计算所有学生的总分
    const studentsWithTotalScore = allStudents.map(student => {
        const totalScore = calculateTotalScore(student, subjects);
        return { ...student, totalScore };
    });
    
    // 按总分排序（从高到低）
    const sortedStudents = [...studentsWithTotalScore].sort((a, b) => b.totalScore - a.totalScore);
    
    // 查找学生的排名位置
    const position = sortedStudents.findIndex(student => student.id === studentData.id);
    return position === -1 ? 'N/A' : position + 1;
}

/**
 * 计算班级各科目平均分
 */
function calculateClassAverageScores(students, subjects) {
    const result = {};
    
    subjects.forEach(subject => {
        // 计算该科目的总分
        let validScoreCount = 0;
        const totalScore = students.reduce((sum, student) => {
            const score = student.scores[subject];
            if (score !== undefined && score !== null) {
                validScoreCount++;
                return sum + score;
            }
            return sum;
        }, 0);
        
        // 计算平均分
        result[subject] = validScoreCount > 0 ? totalScore / validScoreCount : 0;
    });
    
    return result;
}

/**
 * 计算班级各科目最高分
 */
function calculateMaxScores(students, subjects) {
    const result = {};
    
    subjects.forEach(subject => {
        // 找出该科目的最高分
        result[subject] = students.reduce((max, student) => {
            const score = student.scores[subject];
            if (score !== undefined && score !== null && score > max) {
                return score;
            }
            return max;
        }, 0);
    });
    
    return result;
}

/**
 * 初始化分析类型选择器
 */
function initAnalysisTypeSelector() {
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    if (!analysisTypeSelect) return;
    
    // 添加变化事件监听器
    analysisTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        // 隐藏所有分析选项区域
        hideAllAnalysisOptions();
        
        // 显示所选分析类型的选项
        switch (selectedValue) {
            case 'basic':
                // 基本指标分析，无需额外选项
                // 这里可以直接执行基本分析或显示配置选项
                console.log('选择了基本指标分析');
                clearAnalysisResult();
                break;
            case 'personal-detail':
                // 显示个人成绩详情分析选项
                console.log('选择了个人成绩详情分析');
                showDetailAnalysisOptions();
                clearAnalysisResult();
                break;
            case 'personal-trend':
                // 显示个人趋势分析选项
                console.log('选择了个人趋势分析');
                showTrendAnalysisOptions();
                clearAnalysisResult();
                break;
            default:
                // 没有选择任何分析类型
                console.log('未选择分析类型');
                clearAnalysisResult();
                break;
        }
    });
}

/**
 * 隐藏所有分析选项区域
 */
function hideAllAnalysisOptions() {
    hideTrendAnalysisOptions();
    hideDetailAnalysisOptions();
    hideBasicAnalysisOptions();
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
    // 检查是否已存在toast容器
    let toastContainer = document.querySelector('.toast-container');
    
    // 如果不存在，创建一个
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // 添加基本样式
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            .toast {
                min-width: 250px;
                margin-bottom: 10px;
                padding: 12px 20px;
                border-radius: 4px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .toast.show {
                opacity: 1;
            }
            .toast-success {
                background-color: #4caf50;
            }
            .toast-error {
                background-color: #f44336;
            }
            .toast-info {
                background-color: #2196f3;
            }
            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 添加消息和关闭按钮
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.onclick = function() {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    };
    
    toast.appendChild(messageSpan);
    toast.appendChild(closeButton);
    
    // 添加到容器
    toastContainer.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 3秒后自动关闭
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 3000);
}

/**
 * 显示基础指标分析选项
 */
function showBasicAnalysisOptions() {
    const basicOptions = document.getElementById('basicAnalysisOptions');
    if (basicOptions) {
        basicOptions.style.display = 'block';
        
        // 加载所有文件
        loadAllFiles();
        
        // 清空分析结果区域
        clearAnalysisResult();
        
        // 加载文件下拉选项
        loadBasicFileDropdownItems();
    }
}

/**
 * 隐藏基础指标分析选项
 */
function hideBasicAnalysisOptions() {
    const basicOptions = document.getElementById('basicAnalysisOptions');
    if (basicOptions) {
        basicOptions.style.display = 'none';
    }
    
    // 重置下拉框文本
    const selectedText = document.querySelector('.basic-dropdown-selected .selected-text');
    if (selectedText) {
        selectedText.textContent = '-- 请选择成绩表 --';
    }
    
    // 重置选择状态
    selectedFileIds = [];
    updateBasicSelectedFilesList();
}

/**
 * 加载基础指标分析的文件下拉选项
 */
function loadBasicFileDropdownItems() {
    const dropdownMenu = document.getElementById('basicFileDropdownMenu');
    if (!dropdownMenu) return;
    
    // 清空现有选项
    dropdownMenu.innerHTML = '';
    
    // 如果没有文件数据
    if (allFilesCache.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'dropdown-item';
        emptyItem.textContent = '没有可用的成绩表文件';
        dropdownMenu.appendChild(emptyItem);
        return;
    }
    
    // 为每个文件创建选项
    allFilesCache.forEach(file => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // 检查该文件是否已经被选中
        const isSelected = selectedFileIds.includes(file.id);
        if (isSelected) {
            item.classList.add('selected');
        }
        
        // 创建自定义复选框
        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox-indicator';
        
        const text = document.createElement('div');
        text.className = 'dropdown-item-text';
        
        // 格式化日期显示
        let dateDisplay = file.date ? new Date(file.date).toLocaleDateString() : '未知日期';
        
        text.textContent = `${file.name || '未命名'} (${dateDisplay})`;
        
        item.appendChild(checkbox);
        item.appendChild(text);
        
        // 单项选择
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 清除之前的所有选择
            selectedFileIds = [];
            document.querySelectorAll('#basicFileDropdownMenu .dropdown-item').forEach(i => {
                i.classList.remove('selected');
            });
            
            // 选中当前项
            this.classList.add('selected');
            selectedFileIds.push(file.id);
            
            // 更新已选择文件列表显示
            updateBasicSelectedFilesList();
            
            // 更新科目选择下拉框
            updateBasicSubjectOptions();
            
            // 更新生成按钮状态
            updateGenerateBasicButtonState();
        });
        
        dropdownMenu.appendChild(item);
    });
}

/**
 * 更新基础指标分析的已选择文件列表
 */
function updateBasicSelectedFilesList() {
    const selectedFilesList = document.getElementById('basicSelectedFilesList');
    if (!selectedFilesList) return;
    
    // 清空现有内容
    selectedFilesList.innerHTML = '';
    
    // 如果没有选择任何文件
    if (selectedFileIds.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'empty-selected';
        emptyElement.textContent = '未选择任何成绩表';
        selectedFilesList.appendChild(emptyElement);
        
        // 禁用科目选择
        const subjectSelect = document.getElementById('basicSubjectSelect');
        if (subjectSelect) {
            subjectSelect.disabled = true;
            subjectSelect.innerHTML = '<option value="">-- 请先选择成绩表 --</option>';
        }
        return;
    }
    
    // 显示已选择的文件
    selectedFileIds.forEach(fileId => {
        const file = allFilesCache.find(f => f.id === fileId);
        if (file) {
            const fileElement = document.createElement('div');
            fileElement.className = 'selected-file-item';
            
            // 格式化日期显示
            let dateDisplay = file.date ? new Date(file.date).toLocaleDateString() : '未知日期';
            
            fileElement.textContent = `${file.name || '未命名'} (${dateDisplay})`;
            selectedFilesList.appendChild(fileElement);
        }
    });
}

/**
 * 更新基础指标分析的科目选择下拉框
 */
function updateBasicSubjectOptions() {
    const subjectSelect = document.getElementById('basicSubjectSelect');
    if (!subjectSelect) return;
    
    // 如果没有选择文件，禁用科目选择
    if (selectedFileIds.length === 0) {
        subjectSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">-- 请先选择成绩表 --</option>';
        return;
    }
    
    // 获取选中文件的科目列表
    const subjects = getSubjectsFromSelectedFiles();
    
    // 重置下拉框
    subjectSelect.innerHTML = '';
    
    // 添加"全部科目"选项
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '全部科目';
    subjectSelect.appendChild(allOption);
    
    // 添加每个科目选项
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
    
    // 启用下拉框
    subjectSelect.disabled = false;
    
    // 默认选择第一个选项
    subjectSelect.selectedIndex = 0;
}

/**
 * 更新生成基础指标按钮状态
 */
function updateGenerateBasicButtonState() {
    const generateBtn = document.getElementById('generateBasicBtn');
    const subjectSelect = document.getElementById('basicSubjectSelect');
    
    if (!generateBtn || !subjectSelect) return;
    
    // 如果已选择文件且已选择科目，启用按钮
    generateBtn.disabled = !(selectedFileIds.length > 0 && subjectSelect.value);
}

/**
 * 执行基础指标分析
 */
function performBasicAnalysis() {
    // 获取选中的科目
    const subjectSelect = document.getElementById('basicSubjectSelect');
    if (!subjectSelect) return;
    
    const selectedSubject = subjectSelect.value;
    
    // 获取文件数据
    const fileId = selectedFileIds[0]; // 只取第一个文件
    const fileData = getFileById(fileId);
    
    if (!fileData || !fileData.data || !Array.isArray(fileData.data)) {
        showToast('文件数据无效，无法进行分析', 'error');
        return;
    }
    
    // 开始分析
    generateBasicAnalysisResult(fileData, selectedSubject);
}

/**
 * 生成基础指标分析结果
 * @param {Object} fileData - 文件数据
 * @param {string} selectedSubject - 选中的科目，"all"表示全部科目
 */
function generateBasicAnalysisResult(fileData, selectedSubject) {
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    // 清空分析结果区域
    analysisResult.innerHTML = '';
    
    // 获取表头和数据
    const headers = fileData.data[0];
    const studentData = fileData.data.slice(1);
    
    // 获取科目列
    const subjectColumns = getSubjectColumns(headers);
    
    // 获取分数线设置
    const passScore = parseInt(localStorage.getItem('passScore')) || 60;
    const goodScore = parseInt(localStorage.getItem('goodScore')) || 75;
    const excellentScore = parseInt(localStorage.getItem('excellentScore')) || 90;
    
    // 创建分析结果容器
    const resultContainer = document.createElement('div');
    resultContainer.className = 'basic-analysis-container';
    
    // 添加标题
    const title = document.createElement('h3');
    title.className = 'basic-analysis-title';
    title.textContent = `${fileData.name || '未命名'} 成绩基础指标分析`;
    resultContainer.appendChild(title);
    
    if (selectedSubject === 'all') {
        // 全部科目分析
        subjectColumns.forEach(subjectInfo => {
            const subject = headers[subjectInfo.index];
            
            // 创建科目指标卡片
            const subjectCard = createSubjectStatCard(subject, studentData, subjectInfo.index, passScore, goodScore, excellentScore);
            resultContainer.appendChild(subjectCard);
        });
    } else {
        // 单科目分析
        const subjectInfo = subjectColumns.find(info => headers[info.index] === selectedSubject);
        if (subjectInfo) {
            // 创建科目指标卡片
            const subjectCard = createSubjectStatCard(selectedSubject, studentData, subjectInfo.index, passScore, goodScore, excellentScore);
            resultContainer.appendChild(subjectCard);
        } else {
            // 没有找到对应科目
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-message';
            errorMsg.textContent = `未找到科目"${selectedSubject}"的数据`;
            resultContainer.appendChild(errorMsg);
        }
    }
    
    // 添加到分析结果区域
    analysisResult.appendChild(resultContainer);
}

/**
 * 创建科目统计卡片
 * @param {string} subject - 科目名称
 * @param {Array} studentData - 学生数据
 * @param {number} columnIndex - 科目所在列索引
 * @param {number} passScore - 及格分数线
 * @param {number} goodScore - 良好分数线
 * @param {number} excellentScore - 优秀分数线
 * @returns {HTMLElement} 科目统计卡片元素
 */
function createSubjectStatCard(subject, studentData, columnIndex, passScore, goodScore, excellentScore) {
    // 创建科目卡片容器
    const card = document.createElement('div');
    card.className = 'basic-stat-container';
    
    // 添加科目标题
    const subjectTitle = document.createElement('h4');
    subjectTitle.className = 'subject-title';
    subjectTitle.textContent = subject;
    card.appendChild(subjectTitle);
    
    // 收集有效成绩数据
    const scores = [];
    studentData.forEach(student => {
        const scoreStr = student[columnIndex];
        if (scoreStr && !isNaN(scoreStr)) {
            const score = parseFloat(scoreStr);
            scores.push(score);
        }
    });
    
    // 如果没有有效成绩数据
    if (scores.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'no-data-message';
        noDataMsg.textContent = '没有有效的成绩数据';
        card.appendChild(noDataMsg);
        return card;
    }
    
    // 计算统计数据
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // 计算各等级人数
    const excellentCount = scores.filter(score => score >= excellentScore).length;
    const goodCount = scores.filter(score => score >= goodScore && score < excellentScore).length;
    const passCount = scores.filter(score => score >= passScore && score < goodScore).length;
    const failCount = scores.filter(score => score < passScore).length;
    
    // 计算各等级比率
    const totalCount = scores.length;
    const excellentRate = (excellentCount / totalCount * 100).toFixed(2);
    const goodRate = (goodCount / totalCount * 100).toFixed(2);
    const passRate = (passCount / totalCount * 100).toFixed(2);
    const failRate = (failCount / totalCount * 100).toFixed(2);
    
    // 创建指标卡片容器
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'indicators-container';
    
    // 创建上排和下排容器
    const topRow = document.createElement('div');
    topRow.className = 'top-row';
    
    const bottomRow = document.createElement('div');
    bottomRow.className = 'bottom-row';
    
    // 定义指标及其颜色类
    const topRowIndicators = [
        { name: '最高分', value: maxScore.toFixed(1), colorClass: 'indicator-highest', icon: '🏆' },
        { name: '平均分', value: avgScore.toFixed(1), colorClass: 'indicator-average', icon: '📊' },
        { name: '最低分', value: minScore.toFixed(1), colorClass: 'indicator-lowest', icon: '📉' }
    ];
    
    const bottomRowIndicators = [
        { name: '优秀率', value: `${excellentRate}%`, count: excellentCount, colorClass: 'indicator-excellent', icon: '🎯' },
        { name: '良好率', value: `${goodRate}%`, count: goodCount, colorClass: 'indicator-good', icon: '👍' },
        { name: '及格率', value: `${passRate}%`, count: passCount, colorClass: 'indicator-pass', icon: '✅' },
        { name: '不及格率', value: `${failRate}%`, count: failCount, colorClass: 'indicator-fail', icon: '❗' }
    ];
    
    // 创建上排指标卡片
    topRowIndicators.forEach(indicator => {
        const indicatorCard = createIndicatorCard(indicator);
        topRow.appendChild(indicatorCard);
    });
    
    // 创建下排指标卡片
    bottomRowIndicators.forEach(indicator => {
        const indicatorCard = createIndicatorCard(indicator);
        bottomRow.appendChild(indicatorCard);
    });
    
    // 将上下排添加到容器中
    indicatorsContainer.appendChild(topRow);
    indicatorsContainer.appendChild(bottomRow);
    
    card.appendChild(indicatorsContainer);
    return card;
}

/**
 * 创建单个指标卡片
 * @param {Object} indicator - 指标信息
 * @returns {HTMLElement} 指标卡片元素
 */
function createIndicatorCard(indicator) {
    const indicatorCard = document.createElement('div');
    indicatorCard.className = `indicator-card ${indicator.colorClass}`;
    
    const iconElement = document.createElement('div');
    iconElement.className = 'indicator-icon';
    iconElement.textContent = indicator.icon;
    
    const nameElement = document.createElement('div');
    nameElement.className = 'indicator-name';
    nameElement.textContent = indicator.name;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'indicator-value';
    valueElement.textContent = indicator.value;
    
    // 如果有人数信息，添加到卡片
    if (indicator.count !== undefined) {
        const countElement = document.createElement('div');
        countElement.className = 'indicator-count';
        countElement.textContent = `${indicator.count}人`;
        indicatorCard.appendChild(countElement);
    }
    
    indicatorCard.appendChild(iconElement);
    indicatorCard.appendChild(nameElement);
    indicatorCard.appendChild(valueElement);
    
    return indicatorCard;
}

/**
 * 隐藏所有分析选项区域
 */
function hideAllAnalysisOptions() {
    hideTrendAnalysisOptions();
    hideDetailAnalysisOptions();
    hideBasicAnalysisOptions();
} 