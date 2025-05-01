/**
 * 成绩分析系统 - 趋势图科目多选修复脚本
 * 用于修复"个人成绩变化趋势图"中生成趋势图按钮无响应的问题
 */

// 监听DOMContentLoaded事件
document.addEventListener('DOMContentLoaded', function() {
    console.log('趋势图按钮修复脚本已加载');
    
    // 添加0.5秒的延迟，确保在其他脚本加载完成后执行
    setTimeout(function() {
        fixTrendButtonIssue();
    }, 500);
});

/**
 * 修复生成趋势图按钮的问题
 */
function fixTrendButtonIssue() {
    console.log('开始修复生成趋势图按钮问题...');
    
    // 获取生成趋势图按钮
    const generateTrendBtn = document.getElementById('generateTrendBtn');
    
    if (!generateTrendBtn) {
        console.warn('未找到生成趋势图按钮，无法进行修复');
        return;
    }
    
    console.log('找到生成趋势图按钮，开始修复');
    
    // 移除所有现有事件监听器
    const newBtn = generateTrendBtn.cloneNode(true);
    generateTrendBtn.parentNode.replaceChild(newBtn, generateTrendBtn);
    
    // 为新按钮添加点击事件监听器
    newBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('生成趋势图按钮被点击');
        
        // 检查必要条件
        const studentSelect = document.getElementById('studentSelect');
        if (!studentSelect || !studentSelect.value) {
            showMessage('请先选择学生');
            return;
        }
        
        // 获取选中的科目
        let subjects = [];
        if (typeof window.selectedSubjects !== 'undefined' && window.selectedSubjects.length > 0) {
            // 如果存在科目多选数组
            subjects = window.selectedSubjects;
        } else {
            // 尝试从隐藏的下拉框获取科目
            const subjectSelect = document.getElementById('subjectSelect');
            if (subjectSelect && subjectSelect.value) {
                subjects = [subjectSelect.value];
            }
        }
        
        if (subjects.length === 0) {
            showMessage('请至少选择一个科目');
            return;
        }
        
        console.log('选择的科目:', subjects);
        
        // 获取选中的文件ID
        const selectedFileIds = window.selectedFileIds || [];
        if (selectedFileIds.length === 0) {
            showMessage('请至少选择一个成绩表');
            return;
        }
        
        console.log('选择的文件ID:', selectedFileIds);
        
        // 设置全局变量 - 这是关键修复点
        // 确保同时设置单数和复数形式的变量，以兼容不同的代码
        window.selectedSubject = subjects.length === 1 ? 
            subjects[0] : subjects.includes('all') ? 'all' : subjects;
            
        // 确保在全局作用域中同时可用
        selectedSubject = window.selectedSubject;
        
        console.log('设置的selectedSubject:', selectedSubject);
        
        // 创建图表容器
        prepareChartContainer();
        
        // 执行趋势分析函数
        try {
            console.log('尝试执行分析函数...');
            
            // 调用原始的performTrendAnalysis函数
            if (typeof window.performTrendAnalysis === 'function') {
                window.performTrendAnalysis();
            } else if (typeof performTrendAnalysis === 'function') {
                performTrendAnalysis();
            } else {
                console.error('未找到performTrendAnalysis函数');
                showMessage('分析函数不可用，请刷新页面后重试');
            }
        } catch (error) {
            console.error('执行趋势分析时出错:', error);
            showMessage('执行分析出错: ' + error.message);
        }
    });
    
    // 修复科目复选框的变化事件
    fixSubjectCheckboxEvents();
    
    console.log('生成趋势图按钮修复完成');
}

/**
 * 修复科目复选框的变化事件，确保正确更新全局变量
 */
function fixSubjectCheckboxEvents() {
    const checkboxContainer = document.getElementById('subjectCheckboxContainer');
    if (!checkboxContainer) return;
    
    // 监听复选框容器的变化事件
    checkboxContainer.addEventListener('change', function(event) {
        if (event.target && event.target.type === 'checkbox') {
            // 延迟执行，确保selectedSubjects数组已更新
            setTimeout(function() {
                if (typeof window.selectedSubjects !== 'undefined' && window.selectedSubjects.length > 0) {
                    // 更新selectedSubject变量
                    window.selectedSubject = window.selectedSubjects.length === 1 ? 
                        window.selectedSubjects[0] : window.selectedSubjects.includes('all') ? 'all' : window.selectedSubjects;
                    
                    // 确保在全局作用域中同时可用
                    selectedSubject = window.selectedSubject;
                    
                    console.log('科目复选框变化，更新selectedSubject:', selectedSubject);
                }
            }, 0);
        }
    });
}

/**
 * 准备图表容器
 */
function prepareChartContainer() {
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;
    
    // 清空分析结果区域
    analysisResult.innerHTML = `
        <div class="analysis-info">
            <h3>个人成绩变化趋势分析</h3>
            <div class="chart-container">
                <canvas id="trendChart"></canvas>
            </div>
        </div>
    `;
}

/**
 * 显示提示消息
 */
function showMessage(message) {
    console.warn(message);
    
    if (typeof window.showToast === 'function') {
        window.showToast(message, 'warning');
    } else {
        alert(message);
    }
} 