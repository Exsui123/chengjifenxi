/**
 * 成绩分析系统 - 数据分析模块修复脚本
 * 用于修复initCustomGraphByDownload函数缺失的问题
 */

/**
 * 初始化自定义图表下载功能
 * 该函数用于处理图表的下载选项和相关操作
 */
function initCustomGraphByDownload() {
    console.log('初始化图表下载功能');
    
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) {
        console.error('找不到分析结果区域');
        return;
    }
    
    // 查找页面中所有的图表容器
    const chartContainers = document.querySelectorAll('.chart-container');
    if (chartContainers.length === 0) {
        console.log('页面中没有找到图表容器');
        return;
    }
    
    // 为每个图表容器添加下载按钮
    chartContainers.forEach((container, index) => {
        // 检查是否已经添加了下载按钮
        if (container.querySelector('.download-chart-btn')) {
            return;
        }
        
        // 创建下载按钮
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn secondary-btn download-chart-btn';
        downloadBtn.textContent = '下载图表';
        downloadBtn.style.marginTop = '10px';
        
        // 添加点击事件
        downloadBtn.addEventListener('click', function() {
            // 获取当前容器中的canvas元素
            const canvas = container.querySelector('canvas');
            if (!canvas) {
                console.error('未找到canvas元素');
                showToast('无法下载图表', 'error');
                return;
            }
            
            try {
                // 将canvas转换为图片并下载
                const image = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = image;
                downloadLink.download = `成绩分析图表_${index + 1}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                showToast('图表下载成功', 'success');
            } catch (error) {
                console.error('下载图表时出错:', error);
                showToast('图表下载失败', 'error');
            }
        });
        
        // 将按钮添加到图表容器中
        container.appendChild(downloadBtn);
    });
    
    console.log('图表下载功能初始化完成');
}

// 在页面加载时执行初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('分析修复脚本已加载');
    
    // 将initCustomGraphByDownload函数添加到全局作用域
    window.initCustomGraphByDownload = initCustomGraphByDownload;
    
    // 修复分析类型选择器事件
    const fixAnalysisTypeSelector = function() {
        const analysisTypeSelect = document.getElementById('analysisTypeSelect');
        if (!analysisTypeSelect) return;
        
        // 为每个选项添加一个自定义事件
        analysisTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            console.log('修复脚本: 选择了分析类型:', selectedValue);
            
            // 如果选择了个人成绩变化趋势图，确保可以调用initCustomGraphByDownload函数
            if (selectedValue === 'personal-trend') {
                // 在必要时调用initCustomGraphByDownload函数
                setTimeout(function() {
                    if (typeof window.initCustomGraphByDownload === 'function') {
                        window.initCustomGraphByDownload();
                    } else {
                        console.error('修复脚本: initCustomGraphByDownload函数仍不可用');
                    }
                }, 1000); // 给图表加载一些时间
            }
        });
    };
    
    // 等待页面完全加载后执行
    setTimeout(fixAnalysisTypeSelector, 500);
});

// 替换错误的函数引用
const replaceErrorFunctions = function() {
    // 查找所有包含错误函数调用的DOM元素
    const elements = document.querySelectorAll('[onclick*="initCustomGraphByDownload"]');
    elements.forEach(element => {
        // 获取原始的onclick属性
        const originalOnclick = element.getAttribute('onclick');
        if (originalOnclick && originalOnclick.includes('initCustomGraphByDownload')) {
            // 替换为正确的调用
            const newOnclick = originalOnclick.replace(
                /initCustomGraphByDownload\(\)/g, 
                'window.initCustomGraphByDownload ? window.initCustomGraphByDownload() : console.error("函数未定义")'
            );
            element.setAttribute('onclick', newOnclick);
            console.log('修复了函数调用:', element);
        }
    });
};

// 页面完全加载后执行替换操作
window.addEventListener('load', function() {
    setTimeout(replaceErrorFunctions, 1000);
});

/**
 * 计算不同分数段的学生数量
 * @param {Object} fileData - 文件数据
 * @param {string} subject - 科目名称
 * @param {Object} thresholds - 分数线设置
 * @returns {Object} 各分数段学生数量统计
 */
function calculateScoreDistribution(fileData, subject, thresholds) {
    if (!fileData || !fileData.data || !fileData.data.students || !subject || !thresholds) {
        console.error('计算分数分布时缺少必要参数:', { fileData, subject, thresholds });
        return {
            excellentCount: 0,
            goodCount: 0,
            passCount: 0,
            failCount: 0,
            totalValidCount: 0,
            invalidCount: 0
        };
    }

    // 遍历学生数据，统计各分数段人数
    let excellentCount = 0;
    let goodCount = 0;
    let passCount = 0;
    let failCount = 0;
    let invalidCount = 0;
    let totalValidCount = 0;
    
    try {
        // 查找学科列索引
        const headers = fileData.data.headers || [];
        const subjectIndex = headers.findIndex(header => header === subject);
        
        if (subjectIndex === -1) {
            console.warn('未找到科目列:', subject);
            return {
                excellentCount: 0,
                goodCount: 0,
                passCount: 0,
                failCount: 0,
                totalValidCount: 0,
                invalidCount: fileData.data.students.length
            };
        }
        
        // 统计各分数段人数
        fileData.data.students.forEach(student => {
            const score = parseFloat(student[subjectIndex]);
            
            if (isNaN(score)) {
                invalidCount++;
                return;
            }
            
            totalValidCount++;
            
            if (score >= thresholds.excellentScore) {
                excellentCount++;
            } else if (score >= thresholds.goodScore) {
                goodCount++;
            } else if (score >= thresholds.passScore) {
                passCount++;
            } else {
                failCount++;
            }
        });
    } catch (error) {
        console.error('计算分数分布时出错:', error);
    }
    
    return {
        excellentCount,
        goodCount,
        passCount,
        failCount,
        totalValidCount,
        invalidCount
    };
}

// 在页面加载后，将函数添加到window对象中
window.calculateScoreDistribution = calculateScoreDistribution;

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 修复hideAllAnalysisOptions函数
    fixHideAllAnalysisOptions();
    
    // 修复个人小题得分情况分析功能
    fixQuestionScoreAnalysis();
});

/**
 * 修复hideAllAnalysisOptions函数
 * 确保所有的分析选项区域都能被正确隐藏
 */
function fixHideAllAnalysisOptions() {
    // 保存原始函数的引用
    const originalHideAllAnalysisOptions = window.hideAllAnalysisOptions;
    
    // 覆盖原始函数
    window.hideAllAnalysisOptions = function() {
        // 调用原始函数
        if (typeof originalHideAllAnalysisOptions === 'function') {
            originalHideAllAnalysisOptions();
        }
        
        // 调用其他隐藏函数
        if (typeof hideQuestionScoreAnalysisOptions === 'function') {
            hideQuestionScoreAnalysisOptions();
        }
    };
}

/**
 * 修复个人小题得分情况分析功能
 */
function fixQuestionScoreAnalysis() {
    console.log('正在修复个人小题得分情况分析功能...');
    
    // 监听分析类型选择下拉框的变化
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    if (!analysisTypeSelect) {
        console.error('未找到分析类型选择下拉框');
        return;
    }
    
    // 添加change事件监听器
    analysisTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        console.log('分析类型变更为:', selectedValue);
        
        if (selectedValue === 'personal-question-score') {
            console.log('选择了个人小题得分情况分析，确保显示相关选项');
            
            // 确保加载选项区域
            setTimeout(function() {
                if (typeof window.showQuestionScoreAnalysisOptions === 'function') {
                    window.showQuestionScoreAnalysisOptions();
                    
                    // 再次加载文件选项（确保数据加载）
                    if (typeof window.loadQuestionScoreFileOptions === 'function') {
                        setTimeout(window.loadQuestionScoreFileOptions, 100);
                    }
                } else {
                    console.error('showQuestionScoreAnalysisOptions函数不可用');
                }
            }, 100);
        }
    });
    
    // 另外，检查当前是否已选择"个人小题得分情况分析"
    if (analysisTypeSelect.value === 'personal-question-score') {
        console.log('当前已选择个人小题得分情况分析，立即显示相关选项');
        
        if (typeof window.showQuestionScoreAnalysisOptions === 'function') {
            setTimeout(window.showQuestionScoreAnalysisOptions, 100);
        }
    }
    
    console.log('个人小题得分情况分析功能修复完成');
}

/**
 * 确保分析模块关键函数能被全局访问
 * 这个函数会检查并全局暴露数据分析模块中的关键函数
 */
function exposeAnalysisFunctions() {
    console.log('正在确保分析模块关键函数被正确导出...');
    
    // 定义需要暴露的函数列表及其所属模块
    const functionList = [
        { name: 'loadAllFiles', module: 'analysis' },
        { name: 'loadFileDropdownItems', module: 'analysis' },
        { name: 'loadDetailFileDropdownItems', module: 'analysis' },
        { name: 'loadBasicFileSelectOptions', module: 'analysis' },
        { name: 'loadLevelProportionFileOptions', module: 'analysis' },
        { name: 'loadAverageFileDropdownItems', module: 'analysis' },
        { name: 'loadCrossAverageFileDropdownItems', module: 'analysis' },
        { name: 'loadCrossLevelFileDropdownItems', module: 'analysis' },
        { name: 'loadCrossScoreLevelFileDropdownItems', module: 'analysis' },
        { name: 'loadQuestionScoreFileOptions', module: 'questionScoreAnalysis' }
    ];
    
    // 检查每个函数并导出
    functionList.forEach(func => {
        // 如果函数已经存在但没有被暴露到全局
        if (typeof window[func.name] !== 'function' && typeof eval(func.name) === 'function') {
            window[func.name] = eval(func.name);
            console.log(`已导出函数: ${func.name}`);
        }
    });
    
    console.log('分析模块关键函数导出检查完成');
}

// 在页面完全加载后执行函数导出检查
window.addEventListener('load', function() {
    setTimeout(exposeAnalysisFunctions, 1500);
}); 