/**
 * 成绩分析系统 - 模块连接器脚本
 * 负责在不同模块间建立通信，确保数据及时更新
 */

// 保存各个模块的函数引用，确保跨模块调用
const ModuleConnector = {
    // 存储模块功能
    storage: {
        saveToStorage: null,
        getAllFilesFromStorage: null,
        deleteFileById: null
    },
    
    // 上传模块功能
    upload: {
        parseFile: null,
        refreshAnalysisFileLists: null
    },
    
    // 分析模块功能
    analysis: {
        loadAllFiles: null,
        loadFileDropdownItems: null,
        loadDetailFileDropdownItems: null,
        loadBasicFileSelectOptions: null,
        loadLevelProportionFileOptions: null,
        loadAverageFileDropdownItems: null,
        loadCrossAverageFileDropdownItems: null,
        loadCrossLevelFileDropdownItems: null,
        loadCrossScoreLevelFileDropdownItems: null
    },
    
    // 小题得分分析模块功能
    questionScoreAnalysis: {
        loadQuestionScoreFileOptions: null
    },
    
    // 文件列表模块功能
    fileList: {
        refreshFileList: null
    },
    
    /**
     * 初始化模块连接器
     */
    init: function() {
        console.log('初始化模块连接器...');
        
        // 等待一段时间，确保所有模块都已加载完成
        setTimeout(() => {
            this.collectModuleFunctions();
            console.log('模块连接器初始化完成');
        }, 500);
        
        // 监听文件保存事件
        document.addEventListener('fileSaved', (event) => {
            console.log('检测到文件保存事件，正在更新所有分析模块的文件列表...');
            this.refreshAllAnalysisLists();
        });
    },
    
    /**
     * 收集各个模块的函数引用
     */
    collectModuleFunctions: function() {
        // 从全局环境中收集函数引用
        
        // 存储模块
        if (typeof window.saveToStorage === 'function') this.storage.saveToStorage = window.saveToStorage;
        if (typeof window.getAllFilesFromStorage === 'function') this.storage.getAllFilesFromStorage = window.getAllFilesFromStorage;
        if (typeof window.deleteFileById === 'function') this.storage.deleteFileById = window.deleteFileById;
        
        // 上传模块
        if (typeof window.parseFile === 'function') this.upload.parseFile = window.parseFile;
        if (typeof window.refreshAnalysisFileLists === 'function') this.upload.refreshAnalysisFileLists = window.refreshAnalysisFileLists;
        
        // 分析模块
        if (typeof window.loadAllFiles === 'function') this.analysis.loadAllFiles = window.loadAllFiles;
        if (typeof window.loadFileDropdownItems === 'function') this.analysis.loadFileDropdownItems = window.loadFileDropdownItems;
        if (typeof window.loadDetailFileDropdownItems === 'function') this.analysis.loadDetailFileDropdownItems = window.loadDetailFileDropdownItems;
        if (typeof window.loadBasicFileSelectOptions === 'function') this.analysis.loadBasicFileSelectOptions = window.loadBasicFileSelectOptions;
        if (typeof window.loadLevelProportionFileOptions === 'function') this.analysis.loadLevelProportionFileOptions = window.loadLevelProportionFileOptions;
        if (typeof window.loadAverageFileDropdownItems === 'function') this.analysis.loadAverageFileDropdownItems = window.loadAverageFileDropdownItems;
        if (typeof window.loadCrossAverageFileDropdownItems === 'function') this.analysis.loadCrossAverageFileDropdownItems = window.loadCrossAverageFileDropdownItems;
        if (typeof window.loadCrossLevelFileDropdownItems === 'function') this.analysis.loadCrossLevelFileDropdownItems = window.loadCrossLevelFileDropdownItems;
        if (typeof window.loadCrossScoreLevelFileDropdownItems === 'function') this.analysis.loadCrossScoreLevelFileDropdownItems = window.loadCrossScoreLevelFileDropdownItems;
        
        // 小题得分分析模块
        if (typeof window.loadQuestionScoreFileOptions === 'function') this.questionScoreAnalysis.loadQuestionScoreFileOptions = window.loadQuestionScoreFileOptions;
        
        // 文件列表模块
        if (typeof window.refreshFileList === 'function') this.fileList.refreshFileList = window.refreshFileList;
        
        console.log('已收集模块函数引用:', this);
    },
    
    /**
     * 刷新所有分析模块的文件列表
     */
    refreshAllAnalysisLists: function() {
        console.log('开始刷新所有分析模块的文件列表...');
        
        // 刷新分析模块中的文件列表
        if (this.analysis.loadAllFiles) {
            console.log('刷新loadAllFiles');
            this.analysis.loadAllFiles();
        }
        
        // 刷新各个分析类型的文件列表
        if (this.analysis.loadFileDropdownItems) {
            console.log('刷新loadFileDropdownItems');
            this.analysis.loadFileDropdownItems();
        }
        
        if (this.analysis.loadDetailFileDropdownItems) {
            console.log('刷新loadDetailFileDropdownItems');
            this.analysis.loadDetailFileDropdownItems();
        }
        
        if (this.analysis.loadBasicFileSelectOptions) {
            console.log('刷新loadBasicFileSelectOptions');
            this.analysis.loadBasicFileSelectOptions();
        }
        
        if (this.analysis.loadLevelProportionFileOptions) {
            console.log('刷新loadLevelProportionFileOptions');
            this.analysis.loadLevelProportionFileOptions();
        }
        
        if (this.analysis.loadAverageFileDropdownItems) {
            console.log('刷新loadAverageFileDropdownItems');
            this.analysis.loadAverageFileDropdownItems();
        }
        
        if (this.analysis.loadCrossAverageFileDropdownItems) {
            console.log('刷新loadCrossAverageFileDropdownItems');
            this.analysis.loadCrossAverageFileDropdownItems();
        }
        
        if (this.analysis.loadCrossLevelFileDropdownItems) {
            console.log('刷新loadCrossLevelFileDropdownItems');
            this.analysis.loadCrossLevelFileDropdownItems();
        }
        
        if (this.analysis.loadCrossScoreLevelFileDropdownItems) {
            console.log('刷新loadCrossScoreLevelFileDropdownItems');
            this.analysis.loadCrossScoreLevelFileDropdownItems();
        }
        
        // 刷新小题得分分析的文件选择列表
        if (this.questionScoreAnalysis.loadQuestionScoreFileOptions) {
            console.log('刷新loadQuestionScoreFileOptions');
            this.questionScoreAnalysis.loadQuestionScoreFileOptions();
        }
        
        console.log('所有文件选择列表刷新完成');
    }
};

// 在页面加载时初始化模块连接器
document.addEventListener('DOMContentLoaded', function() {
    ModuleConnector.init();
    console.log('模块连接器已加载');
});

// 暴露模块连接器到全局环境
window.ModuleConnector = ModuleConnector; 