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