/**
 * 成绩分析系统 - 小题得分分析修复脚本
 * 用于解决个人小题得分情况分析中成绩表无法加载的问题
 */

// 在页面加载完成后执行
window.addEventListener('load', function() {
    console.log('小题得分分析修复脚本已加载');
    fixQuestionScoreAnalysis();
});

/**
 * 修复个人小题得分情况分析功能
 * 主要解决成绩表无法选择的问题
 */
function fixQuestionScoreAnalysis() {
    console.log('开始修复个人小题得分情况分析功能...');
    
    // 监听分析类型选择框变化
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    if (analysisTypeSelect) {
        // 添加专门的事件监听器
        analysisTypeSelect.addEventListener('change', handleAnalysisTypeChange);
        
        // 立即检查当前选择
        handleAnalysisTypeChange.call(analysisTypeSelect);
    }
    
    // 定期检查是否已显示个人小题得分情况分析选项
    const checkInterval = setInterval(function() {
        if (analysisTypeSelect && analysisTypeSelect.value === 'personal-question-score') {
            const optionsArea = document.getElementById('questionScoreAnalysisOptions');
            if (optionsArea && optionsArea.style.display === 'none') {
                console.log('检测到选项区域未显示，尝试再次显示');
                showQuestionScoreOptions();
            }
            
            // 检查文件选择下拉框是否有选项
            const fileSelect = document.getElementById('questionScoreFileSelect');
            if (fileSelect && fileSelect.options.length <= 1) {
                console.log('检测到文件选择下拉框没有选项，尝试重新加载');
                loadScoreFiles();
            }
        }
    }, 1000);
    
    // 30秒后清除检查间隔
    setTimeout(function() {
        clearInterval(checkInterval);
    }, 30000);
    
    // 修复学生选择下拉框
    fixStudentSelect();
    
    console.log('个人小题得分情况分析修复完成');
}

/**
 * 处理分析类型变化
 */
function handleAnalysisTypeChange() {
    const selectedValue = this.value;
    console.log('分析类型变化:', selectedValue);
    
    if (selectedValue === 'personal-question-score') {
        console.log('选择了个人小题得分情况分析');
        
        // 延迟显示选项，确保其他隐藏操作已完成
        setTimeout(showQuestionScoreOptions, 200);
    }
}

/**
 * 显示个人小题得分情况分析选项
 */
function showQuestionScoreOptions() {
    console.log('正在显示个人小题得分情况分析选项...');
    
    // 显示选项区域
    const optionsArea = document.getElementById('questionScoreAnalysisOptions');
    if (optionsArea) {
        optionsArea.style.display = 'block';
        console.log('选项区域已显示');
    } else {
        console.error('未找到选项区域');
    }
    
    // 加载成绩表
    loadScoreFiles();
}

/**
 * 加载成绩表数据
 */
function loadScoreFiles() {
    console.log('正在加载成绩表数据...');
    
    // 获取文件选择下拉框
    const fileSelect = document.getElementById('questionScoreFileSelect');
    if (!fileSelect) {
        console.error('未找到文件选择下拉框');
        return;
    }
    
    // 清空下拉框
    fileSelect.innerHTML = '<option value="">-- 请选择成绩表 --</option>';
    
    // 从localStorage获取文件数据
    try {
        const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
        console.log(`找到${filesData.length}个成绩表`);
        
        if (filesData.length === 0) {
            fileSelect.innerHTML += '<option value="" disabled>没有找到成绩表数据</option>';
            return;
        }
        
        // 添加文件选项
        filesData.forEach(file => {
            if (!file || !file.id) return;
            
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = `${file.name || '未命名'} - ${file.class || '未知班级'} (${file.date || '无日期'})`;
            fileSelect.appendChild(option);
            console.log('添加文件选项:', option.textContent);
        });
        
        // 启用文件选择下拉框
        fileSelect.disabled = false;
        
        // 添加change事件处理
        if (!fileSelect._hasChangeEvent) {
            fileSelect.addEventListener('change', function() {
                console.log('选择了成绩表:', this.value);
                handleFileSelection(this.value);
            });
            fileSelect._hasChangeEvent = true;
        }
    } catch (error) {
        console.error('加载成绩表数据时出错:', error);
        fileSelect.innerHTML += '<option value="" disabled>加载成绩表数据时出错</option>';
    }
}

/**
 * 处理文件选择
 * @param {string} fileId - 选择的文件ID
 */
function handleFileSelection(fileId) {
    if (!fileId) return;
    
    console.log('处理文件选择:', fileId);
    
    // 获取学生选择下拉框
    const studentSelect = document.getElementById('questionScoreStudentSelect');
    if (!studentSelect) {
        console.error('未找到学生选择下拉框');
        return;
    }
    
    // 清空学生选择下拉框
    studentSelect.innerHTML = '<option value="">-- 请选择学生 --</option>';
    
    // 加载学生数据
    try {
        const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
        const fileData = filesData.find(file => file.id === fileId);
        
        if (!fileData || !fileData.data || !fileData.data.length) {
            console.error('未找到文件数据或数据格式错误');
            studentSelect.innerHTML += '<option value="" disabled>未找到学生数据</option>';
            return;
        }
        
        // 查找学号和姓名列的索引
        const headers = fileData.data[0];
        let idColumnIndex = -1;
        let nameColumnIndex = -1;
        
        // 尝试查找学号列
        for (let i = 0; i < headers.length; i++) {
            const header = String(headers[i]).toLowerCase();
            if (header.includes('学号') || header.includes('id') || header === 'no' || header === 'no.') {
                idColumnIndex = i;
                break;
            }
        }
        
        // 尝试查找姓名列
        for (let i = 0; i < headers.length; i++) {
            const header = String(headers[i]).toLowerCase();
            if (header.includes('姓名') || header.includes('name') || header === '名字') {
                nameColumnIndex = i;
                break;
            }
        }
        
        if (idColumnIndex === -1 || nameColumnIndex === -1) {
            console.error('未找到学号或姓名列');
            studentSelect.innerHTML += '<option value="" disabled>无法识别学生数据</option>';
            return;
        }
        
        // 添加学生选项
        for (let i = 1; i < fileData.data.length; i++) {
            const row = fileData.data[i];
            if (!row || row.length <= Math.max(idColumnIndex, nameColumnIndex)) continue;
            
            const studentId = row[idColumnIndex];
            const studentName = row[nameColumnIndex];
            
            if (!studentId || !studentName) continue;
            
            const option = document.createElement('option');
            option.value = studentId;
            option.textContent = `${studentName} (${studentId})`;
            studentSelect.appendChild(option);
        }
        
        // 启用学生选择下拉框
        studentSelect.disabled = false;
        
        console.log(`已加载${studentSelect.options.length - 1}个学生选项`);
    } catch (error) {
        console.error('加载学生数据时出错:', error);
        studentSelect.innerHTML += '<option value="" disabled>加载学生数据时出错</option>';
    }
}

/**
 * 修复学生选择下拉框
 */
function fixStudentSelect() {
    const studentSelect = document.getElementById('questionScoreStudentSelect');
    if (!studentSelect) return;
    
    // 添加change事件处理
    if (!studentSelect._hasChangeEvent) {
        studentSelect.addEventListener('change', function() {
            console.log('选择了学生:', this.value);
            
            // 启用生成按钮
            const generateBtn = document.getElementById('generateQuestionScoreBtn');
            if (generateBtn) {
                generateBtn.disabled = !this.value;
            }
        });
        studentSelect._hasChangeEvent = true;
    }
    
    // 修复生成按钮
    const generateBtn = document.getElementById('generateQuestionScoreBtn');
    if (generateBtn && !generateBtn._hasClickEvent) {
        generateBtn.addEventListener('click', function() {
            console.log('点击了生成分析按钮');
            
            const fileSelect = document.getElementById('questionScoreFileSelect');
            const studentSelect = document.getElementById('questionScoreStudentSelect');
            
            if (!fileSelect || !studentSelect) return;
            
            const fileId = fileSelect.value;
            const studentId = studentSelect.value;
            
            if (!fileId || !studentId) {
                alert('请选择成绩表和学生');
                return;
            }
            
            // 调用分析函数
            if (typeof window.performQuestionScoreAnalysis === 'function') {
                // 设置全局变量
                window.selectedQuestionScoreFileId = fileId;
                window.selectedQuestionScoreStudentId = studentId;
                
                window.performQuestionScoreAnalysis();
            } else {
                console.error('performQuestionScoreAnalysis函数不可用');
                alert('分析功能暂时不可用，请刷新页面后重试');
            }
        });
        generateBtn._hasClickEvent = true;
    }
} 