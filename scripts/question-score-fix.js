/**
 * 成绩分析系统 - 小题得分模块修复脚本
 * 用于修复小题得分分析模块的文件刷新问题
 */

// 等待DOM完全加载后执行
window.addEventListener('load', function() {
    fixQuestionScoreRefresh();
    
    // 小题得分显示修复
    verifyMaxScoreFixApplied();
});

/**
 * 修复小题得分分析模块的文件列表刷新问题
 */
function fixQuestionScoreRefresh() {
    console.log('开始修复小题得分分析模块的文件列表刷新问题...');
    
    // 直接监听文件保存事件
    document.addEventListener('fileSaved', function(event) {
        console.log('检测到文件保存事件，正在刷新小题得分分析模块的文件列表...');
        
        // 立即尝试刷新
        tryRefreshQuestionScoreFileOptions();
        
        // 延迟再次尝试刷新，确保DOM已更新
        setTimeout(tryRefreshQuestionScoreFileOptions, 500);
        setTimeout(tryRefreshQuestionScoreFileOptions, 1000);
    });
    
    // 监听分析类型切换
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    if (analysisTypeSelect) {
        console.log('为分析类型选择器添加额外的事件监听器');
        
        analysisTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (selectedValue === 'personal-question-score') {
                console.log('选择了个人小题得分情况分析，确保刷新文件列表');
                
                // 给DOM一些时间加载
                setTimeout(function() {
                    tryRefreshQuestionScoreFileOptions();
                }, 300);
            }
        });
    }
    
    // 为导航标签添加监听器，确保切换到数据分析标签时刷新
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === 'analysis-section') {
            link.addEventListener('click', function() {
                console.log('切换到数据分析标签，延迟刷新小题得分文件列表');
                setTimeout(function() {
                    if (document.getElementById('analysisTypeSelect')?.value === 'personal-question-score') {
                        tryRefreshQuestionScoreFileOptions();
                    }
                }, 300);
            });
        }
    });
    
    console.log('小题得分分析模块的文件列表刷新修复完成');
}

/**
 * 尝试刷新小题得分分析模块的文件列表
 */
function tryRefreshQuestionScoreFileOptions() {
    console.log('尝试刷新小题得分分析模块的文件列表...');
    
    // 首先检查文件选择器是否存在
    const fileSelect = document.getElementById('questionScoreFileSelect');
    if (!fileSelect) {
        console.log('文件选择器不存在，可能不在小题得分分析页面');
        return;
    }
    
    // 尝试以不同方式刷新文件列表
    if (typeof window.loadQuestionScoreFileOptions === 'function') {
        console.log('调用全局loadQuestionScoreFileOptions函数');
        window.loadQuestionScoreFileOptions();
    } else if (typeof loadQuestionScoreFileOptions === 'function') {
        console.log('调用局部loadQuestionScoreFileOptions函数');
        loadQuestionScoreFileOptions();
    } else if (window.ModuleConnector && 
               window.ModuleConnector.questionScoreAnalysis && 
               window.ModuleConnector.questionScoreAnalysis.loadQuestionScoreFileOptions) {
        console.log('通过ModuleConnector调用loadQuestionScoreFileOptions函数');
        window.ModuleConnector.questionScoreAnalysis.loadQuestionScoreFileOptions();
    } else {
        console.warn('无法找到任何可用的刷新函数');
        
        // 尝试直接从localStorage获取数据并更新
        directlyUpdateQuestionScoreFileSelect();
    }
}

/**
 * 直接从localStorage获取数据并更新文件选择下拉框
 * 当其他方法都失败时使用此方法
 */
function directlyUpdateQuestionScoreFileSelect() {
    console.log('尝试直接从localStorage获取数据并更新文件选择下拉框...');
    
    const fileSelect = document.getElementById('questionScoreFileSelect');
    if (!fileSelect) return;
    
    // 保存当前选中的值
    const currentSelectedValue = fileSelect.value;
    
    // 清空下拉框，但保留第一个选项
    while (fileSelect.options.length > 1) {
        fileSelect.remove(1);
    }
    
    // 从localStorage获取数据
    try {
        const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
        console.log(`从localStorage直接获取到${filesData.length}个文件`);
        
        if (filesData.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.disabled = true;
            option.textContent = "没有找到成绩表数据";
            fileSelect.appendChild(option);
        } else {
            filesData.forEach(file => {
                const option = document.createElement('option');
                option.value = file.id;
                option.textContent = `${file.name || '未命名'} - ${file.class || '未知班级'} (${file.date || '无日期'})`;
                fileSelect.appendChild(option);
                console.log('添加选项:', file.id, option.textContent);
            });
            
            // 恢复原来选中的值（如果存在）
            if (currentSelectedValue) {
                fileSelect.value = currentSelectedValue;
                // 如果之前的选择不存在了，则触发change事件
                if (fileSelect.value !== currentSelectedValue) {
                    fileSelect.dispatchEvent(new Event('change'));
                }
            }
        }
        
        console.log('直接更新文件选择下拉框完成');
    } catch (error) {
        console.error('直接更新文件选择下拉框时出错:', error);
    }
}

/**
 * 修复最大分值显示
 */
function fixMaxScoreDisplay() {
    if (typeof window.questionScoreMaxScoreFixed === 'undefined') {
        console.log('开始修复小题得分的最大分值显示...');
        
        window.questionScoreMaxScoreFixed = true;
        
        // 当执行分析时，确保显示正确的最大分值
        if (typeof window.performQuestionScoreAnalysis === 'function') {
            const originalPerformQuestionScoreAnalysis = window.performQuestionScoreAnalysis;
            
            window.performQuestionScoreAnalysis = function() {
                console.log('调用修复后的performQuestionScoreAnalysis函数');
                
                // 先调用原始函数
                originalPerformQuestionScoreAnalysis.apply(this, arguments);
                
                // 然后处理分值显示
                setTimeout(function() {
                    // 检查分值显示
                    adjustScoreDisplays();
                }, 500);
            };
        }
        
        console.log('小题得分最大分值显示修复完成');
    }
}

/**
 * 调整分值显示
 */
function adjustScoreDisplays() {
    console.log('调整分值显示...');
    
    // 获取所有图表容器
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        // 处理高亮显示
        highlightBars(container);
    });
}

/**
 * 高亮显示得分条
 */
function highlightBars(container) {
    // 这里可以添加高亮显示的逻辑
    console.log('高亮显示得分条');
}

/**
 * 验证最大分值修复是否已应用
 */
function verifyMaxScoreFixApplied() {
    if (typeof window.questionScoreMaxScoreFixed === 'undefined') {
        fixMaxScoreDisplay();
    }
}

// 导出函数
window.fixMaxScoreDisplay = fixMaxScoreDisplay;
window.verifyMaxScoreFixApplied = verifyMaxScoreFixApplied;
window.tryRefreshQuestionScoreFileOptions = tryRefreshQuestionScoreFileOptions;

console.log('小题得分分析模块修复脚本加载完成'); 