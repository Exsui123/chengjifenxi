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
    
    // 学生选择变化事件
    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect) {
        studentSelect.addEventListener('change', function() {
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
    if (!analysisResult) return;
    
    analysisResult.innerHTML = `
        <div class="empty-analysis">
            <p>请选择分析类型</p>
        </div>
    `;
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