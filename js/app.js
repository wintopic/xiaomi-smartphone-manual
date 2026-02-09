/**
 * ============================================================================
 * Smartphone User Guide - Main JavaScript Application
 * 智能手机使用指南 - 主应用脚本
 * ============================================================================
 * 
 * @file        app.js
 * @description 专为老年用户优化的交互式智能手机使用指南
 * @version     2.0.0
 * @author      Development Team
 * @license     MIT
 * 
 * ============================================================================
 */

// =============================================================================
// Constants & Configuration
// =============================================================================

/** @constant {string} APP_VERSION - 应用版本号 */
const APP_VERSION = '2.0.0';

/** @constant {string} STORAGE_KEY_PREFIX - 本地存储键前缀 */
const STORAGE_KEY_PREFIX = 'smartphone_guide_';

/** @constant {Object} STORAGE_KEYS - 本地存储键名集合 */
const STORAGE_KEYS = {
    THEME: `${STORAGE_KEY_PREFIX}theme`,
    FONT_SIZE: `${STORAGE_KEY_PREFIX}font_size`,
    READING_PROGRESS: `${STORAGE_KEY_PREFIX}reading_progress`,
    USER_PREFERENCES: `${STORAGE_KEY_PREFIX}user_preferences`
};

/** @constant {Object} FONT_SIZES - 字体大小配置 */
const FONT_SIZES = {
    NORMAL: 'normal',
    LARGE: 'large',
    XLARGE: 'xlarge'
};

/** @constant {Object} THEMES - 主题配置 */
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

/** @constant {number} DEBOUNCE_DELAY - 防抖延迟时间(ms) */
const DEBOUNCE_DELAY = 150;

/** @constant {number} SCROLL_THROTTLE - 滚动节流时间(ms) */
const SCROLL_THROTTLE = 100;

// =============================================================================
// DOM Ready Initialization
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

/**
 * 初始化应用程序
 * @function initializeApplication
 */
function initializeApplication() {
    ApplicationController.initialize();
    FontSizeController.initialize();
    ImageViewer.initialize();
    IconSystem.initialize();
    LazyLoadManager.initialize();

    console.log(`📱 Smartphone User Guide v${APP_VERSION} initialized`);
}

// =============================================================================
// Application Controller - 应用主控制器
// =============================================================================

/**
 * @namespace ApplicationController
 * @description 应用主控制器，管理页面导航、主题、搜索等核心功能
 */
const ApplicationController = {
    /** @type {Array<HTMLElement>} 内容区块列表 */
    contentSections: [],
    
    /** @type {number} 当前区块索引 */
    currentSectionIndex: 0,
    
    /** @type {Object} DOM元素缓存 */
    elements: {},
    
    /** @type {number|null} 滚动节流定时器 */
    scrollThrottleTimer: null,
    
    /**
     * 初始化应用控制器
     * @method initialize
     */
    initialize() {
        this.cacheDomElements();
        this.bindEventListeners();
        this.loadSavedTheme();
        this.loadSavedProgress();
        this.updateNavigationControls();
        this.syncMobileFontButton();
    },
    
    /**
     * 缓存DOM元素引用
     * @method cacheDomElements
     */
    cacheDomElements() {
        this.elements = {
            // Navigation Elements
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.getElementById('sidebar'),
            mainContent: document.getElementById('mainContent'),
            navLinks: document.querySelectorAll('.nav-link'),
            
            // Theme Elements
            themeToggle: document.getElementById('themeToggle'),
            
            // Search Elements
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchBtn'),
            searchResults: document.getElementById('searchResults'),
            searchContent: document.getElementById('searchContent'),
            searchCloseButton: document.getElementById('closeSearch'),
            searchToggleMobile: document.getElementById('searchToggleMobile'),
            
            // Progress Elements
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            
            // Navigation Buttons
            previousButton: document.getElementById('prevBtn'),
            nextButton: document.getElementById('nextBtn'),
            currentPageIndicator: document.getElementById('currentPage'),
            totalPagesIndicator: document.getElementById('totalPages'),
            
            // Content Elements
            contentSections: document.querySelectorAll('.content-section'),
            contentWrapper: document.getElementById('contentWrapper'),
            
            // Mobile Elements
            fontToggleMobile: document.getElementById('fontToggleMobile'),
            fontSizeControls: document.querySelector('.font-size-controls'),
            searchBox: document.querySelector('.search-box')
        };
        
        // Cache content sections as array for easier manipulation
        this.contentSections = Array.from(this.elements.contentSections);
    },
    
    /**
     * 绑定事件监听器
     * @method bindEventListeners
     */
    bindEventListeners() {
        const { elements } = this;
        
        // Menu toggle
        elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        
        // Theme toggle
        elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Search functionality
        elements.searchButton?.addEventListener('click', () => this.performSearch());
        elements.searchInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.performSearch();
        });
        elements.searchCloseButton?.addEventListener('click', () => this.hideSearchResults());
        
        // Navigation buttons
        elements.previousButton?.addEventListener('click', () => this.navigateToSection('previous'));
        elements.nextButton?.addEventListener('click', () => this.navigateToSection('next'));
        
        // Navigation links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (event) => this.handleNavigationClick(event, link));
        });
        
        // Mobile controls
        elements.fontToggleMobile?.addEventListener('click', () => this.toggleFontSizeControls());
        elements.searchToggleMobile?.addEventListener('click', () => this.toggleSearchBox());
        
        // Close sidebar when clicking main content
        elements.mainContent?.addEventListener('click', (event) => {
            if (elements.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });
        
        // Close search box when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.search-box') && 
                !event.target.closest('.search-toggle-mobile')) {
                elements.searchBox?.classList.remove('active');
                elements.searchToggleMobile?.classList.remove('active');
            }
        });
        
        // Scroll and resize handlers
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleKeyboardShortcuts(event));
    },
    
    // =========================================================================
    // Sidebar & Navigation Methods
    // =========================================================================
    
    /**
     * 切换侧边栏显示状态
     * @method toggleSidebar
     */
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('active');
    },
    
    /**
     * 关闭侧边栏
     * @method closeSidebar
     */
    closeSidebar() {
        this.elements.sidebar.classList.remove('active');
    },
    
    /**
     * 处理导航链接点击
     * @method handleNavigationClick
     * @param {Event} event - 点击事件
     * @param {HTMLElement} link - 被点击的链接元素
     */
    handleNavigationClick(event, link) {
        event.preventDefault();
        
        const sectionId = link.getAttribute('data-section');
        this.displaySection(sectionId);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 991) {
            this.closeSidebar();
        }
        
        this.updateActiveNavigation(link);
        this.updateReadingProgress();
    },
    
    /**
     * 显示指定区块
     * @method displaySection
     * @param {string} sectionId - 区块ID
     */
    displaySection(sectionId) {
        this.contentSections.forEach(section => {
            const isTarget = section.getAttribute('data-section') === sectionId;
            section.style.display = isTarget ? 'block' : 'none';
        });
        
        const targetSection = this.contentSections.find(
            section => section.getAttribute('data-section') === sectionId
        );
        
        if (targetSection) {
            this.currentSectionIndex = this.contentSections.indexOf(targetSection);
            this.updateNavigationControls();
            this.saveReadingProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    
    /**
     * 更新活动导航状态
     * @method updateActiveNavigation
     * @param {HTMLElement} activeLink - 当前活动的链接
     */
    updateActiveNavigation(activeLink) {
        this.elements.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    },
    
    /**
     * 导航到上一页/下一页
     * @method navigateToSection
     * @param {string} direction - 导航方向 ('previous' | 'next')
     */
    navigateToSection(direction) {
        if (direction === 'next' && this.currentSectionIndex < this.contentSections.length - 1) {
            this.currentSectionIndex++;
        } else if (direction === 'previous' && this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
        }
        
        const targetSection = this.contentSections[this.currentSectionIndex];
        const sectionId = targetSection.getAttribute('data-section');
        
        this.displaySection(sectionId);
        
        const navLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (navLink) {
            this.updateActiveNavigation(navLink);
            this.updateReadingProgress();
        }
    },
    
    /**
     * 更新导航控件状态
     * @method updateNavigationControls
     */
    updateNavigationControls() {
        const { elements, currentSectionIndex, contentSections } = this;
        const totalSections = contentSections.length;
        
        elements.currentPageIndicator.textContent = currentSectionIndex + 1;
        elements.totalPagesIndicator.textContent = totalSections;
        
        elements.previousButton.disabled = currentSectionIndex === 0;
        elements.nextButton.disabled = currentSectionIndex === totalSections - 1;
    },
    
    // =========================================================================
    // Theme Management Methods
    // =========================================================================
    
    /**
     * 切换主题
     * @method toggleTheme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        this.updateThemeIcon();
    },
    
    /**
     * 加载保存的主题
     * @method loadSavedTheme
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? THEMES.DARK : THEMES.LIGHT);
        
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon();
    },
    
    /**
     * 更新主题图标
     * @method updateThemeIcon
     */
    updateThemeIcon() {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === THEMES.DARK;
        const iconContainer = this.elements.themeToggle?.querySelector('.theme-icon');
        
        if (!iconContainer) return;
        
        const sunIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        
        const moonIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        
        iconContainer.innerHTML = isDarkMode ? moonIcon : sunIcon;
    },
    
    // =========================================================================
    // Search Functionality Methods
    // =========================================================================
    
    /**
     * 执行搜索
     * @method performSearch
     */
    performSearch() {
        const query = this.elements.searchInput.value.trim().toLowerCase();
        
        if (!query) {
            this.hideSearchResults();
            return;
        }
        
        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    },
    
    /**
     * 搜索内容
     * @method searchContent
     * @param {string} query - 搜索关键词
     * @returns {Array<Object>} 搜索结果列表
     */
    searchContent(query) {
        const results = [];
        
        this.contentSections.forEach(section => {
            const sectionId = section.getAttribute('data-section');
            const sectionTitle = section.querySelector('.section-title')?.textContent || '';
            const sectionText = section.textContent.toLowerCase();
            
            if (sectionText.includes(query)) {
                const context = this.extractSearchContext(section.textContent, query);
                
                results.push({
                    sectionId,
                    title: sectionTitle,
                    context
                });
            }
        });
        
        return results;
    },
    
    /**
     * 提取搜索上下文
     * @method extractSearchContext
     * @param {string} content - 完整内容
     * @param {string} query - 搜索关键词
     * @returns {string} 带高亮的上下文
     */
    extractSearchContext(content, query) {
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(query);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        
        let context = content.substring(start, end);
        context = context.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
        
        return '...' + context + '...';
    },
    
    /**
     * 显示搜索结果
     * @method displaySearchResults
     * @param {Array<Object>} results - 搜索结果
     * @param {string} query - 搜索关键词
     */
    displaySearchResults(results, query) {
        const { searchContent, searchResults } = this.elements;
        
        if (results.length === 0) {
            searchContent.innerHTML = `
                <div class="search-result-item">
                    <p>未找到包含 "${query}" 的内容</p>
                </div>
            `;
        } else {
            searchContent.innerHTML = results.map(result => `
                <div class="search-result-item" data-section="${result.sectionId}">
                    <h4>${result.title}</h4>
                    <p>${result.context}</p>
                </div>
            `).join('');
            
            // Add click handlers to results
            searchContent.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const sectionId = item.getAttribute('data-section');
                    this.displaySection(sectionId);
                    this.hideSearchResults();
                    this.elements.searchInput.value = '';
                });
            });
        }
        
        searchResults.style.display = 'block';
    },
    
    /**
     * 隐藏搜索结果
     * @method hideSearchResults
     */
    hideSearchResults() {
        this.elements.searchResults.style.display = 'none';
    },
    
    // =========================================================================
    // Mobile UI Methods
    // =========================================================================
    
    /**
     * 切换字体大小控件显示
     * @method toggleFontSizeControls
     */
    toggleFontSizeControls() {
        const sizes = [FONT_SIZES.NORMAL, FONT_SIZES.LARGE, FONT_SIZES.XLARGE];
        const currentSize = this.elements.fontToggleMobile?.getAttribute('data-size') || FONT_SIZES.LARGE;
        const currentIndex = sizes.indexOf(currentSize);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        
        FontSizeController.setFontSize(nextSize);
        this.updateMobileFontButtonIcon(nextSize);
    },
    
    /**
     * 更新移动端字体按钮图标
     * @method updateMobileFontButtonIcon
     * @param {string} size - 字体大小
     */
    updateMobileFontButtonIcon(size) {
        const button = this.elements.fontToggleMobile;
        if (!button) return;
        
        button.setAttribute('data-size', size);
        button.querySelectorAll('.font-icon-svg').forEach(svg => svg.classList.remove('active'));
        
        const activeIcon = button.querySelector(`.font-icon-${size}`);
        if (activeIcon) activeIcon.classList.add('active');
    },
    
    /**
     * 同步移动端字体按钮
     * @method syncMobileFontButton
     */
    syncMobileFontButton() {
        const savedSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || FONT_SIZES.LARGE;
        this.updateMobileFontButtonIcon(savedSize);
    },
    
    /**
     * 切换搜索框显示
     * @method toggleSearchBox
     */
    toggleSearchBox() {
        this.elements.searchBox?.classList.toggle('active');
        this.elements.searchToggleMobile?.classList.toggle('active');
        
        if (this.elements.searchBox?.classList.contains('active')) {
            setTimeout(() => this.elements.searchInput?.focus(), 100);
        }
    },
    
    // =========================================================================
    // Progress & Storage Methods
    // =========================================================================
    
    /**
     * 更新阅读进度
     * @method updateReadingProgress
     */
    updateReadingProgress() {
        const navLinks = Array.from(this.elements.navLinks);
        const activeLink = document.querySelector('.nav-link.active');
        
        let progress = 0;
        if (activeLink) {
            const activeIndex = navLinks.indexOf(activeLink);
            progress = navLinks.length > 1 ? (activeIndex / (navLinks.length - 1)) * 100 : 0;
        }
        
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressText.textContent = `阅读进度: ${Math.round(progress)}%`;
    },
    
    /**
     * 保存阅读进度
     * @method saveReadingProgress
     */
    saveReadingProgress() {
        const data = {
            sectionIndex: this.currentSectionIndex,
            sectionId: this.contentSections[this.currentSectionIndex]?.getAttribute('data-section'),
            timestamp: Date.now()
        };
        
        localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(data));
    },
    
    /**
     * 加载保存的阅读进度
     * @method loadSavedProgress
     */
    loadSavedProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
            if (!saved) {
                this.updateReadingProgress();
                return;
            }
            
            const data = JSON.parse(saved);
            if (data.sectionId) {
                this.displaySection(data.sectionId);
                
                const navLink = document.querySelector(`.nav-link[data-section="${data.sectionId}"]`);
                if (navLink) this.updateActiveNavigation(navLink);
            }
        } catch (error) {
            console.warn('Failed to load reading progress:', error);
        }
        
        this.updateReadingProgress();
    },
    
    // =========================================================================
    // Event Handler Methods
    // =========================================================================
    
    /**
     * 处理滚动事件
     * @method handleScroll
     */
    handleScroll() {
        if (this.scrollThrottleTimer) return;
        
        this.scrollThrottleTimer = setTimeout(() => {
            this.updateReadingProgress();
            this.scrollThrottleTimer = null;
        }, SCROLL_THROTTLE);
    },
    
    /**
     * 处理窗口大小改变
     * @method handleResize
     */
    handleResize() {
        if (window.innerWidth > 991) {
            this.closeSidebar();
        }
    },
    
    /**
     * 处理键盘快捷键
     * @method handleKeyboardShortcuts
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyboardShortcuts(event) {
        switch (event.key) {
            case 'Escape':
                ImageViewer.close();
                this.hideSearchResults();
                break;
            case 'ArrowLeft':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.navigateToSection('previous');
                }
                break;
            case 'ArrowRight':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.navigateToSection('next');
                }
                break;
        }
    }
};

// =============================================================================
// Font Size Controller - 字体大小控制器
// =============================================================================

/**
 * @namespace FontSizeController
 * @description 管理字体大小设置和切换
 */
const FontSizeController = {
    /**
     * 初始化字体大小控制器
     * @method initialize
     */
    initialize() {
        this.bindEventListeners();
        this.loadSavedFontSize();
    },
    
    /**
     * 绑定事件监听器
     * @method bindEventListeners
     */
    bindEventListeners() {
        document.querySelectorAll('.font-btn').forEach(button => {
            button.addEventListener('click', () => {
                const size = button.getAttribute('data-size');
                this.setFontSize(size);
            });
        });
    },
    
    /**
     * 设置字体大小
     * @method setFontSize
     * @param {string} size - 字体大小 (normal | large | xlarge)
     */
    setFontSize(size) {
        document.body.setAttribute('data-font-size', size);
        localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
        
        // Update button states
        document.querySelectorAll('.font-btn').forEach(button => {
            const isActive = button.getAttribute('data-size') === size;
            button.classList.toggle('active', isActive);
        });
        
        // Sync mobile button
        if (ApplicationController.updateMobileFontButtonIcon) {
            ApplicationController.updateMobileFontButtonIcon(size);
        }
    },
    
    /**
     * 加载保存的字体大小
     * @method loadSavedFontSize
     */
    loadSavedFontSize() {
        const savedSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || FONT_SIZES.LARGE;
        this.setFontSize(savedSize);
    }
};

// =============================================================================
// Image Viewer - 图片查看器
// =============================================================================

/**
 * @namespace ImageViewer
 * @description 图片放大查看器，支持缩放和拖动（Figma风格以鼠标位置为中心缩放）
 */
const ImageViewer = {
    /** @type {number} 当前缩放比例 */
    currentZoom: 1,

    /** @type {boolean} 是否正在拖动 */
    isDragging: false,

    /** @type {number} 拖动起始X坐标 */
    dragStartX: 0,

    /** @type {number} 拖动起始Y坐标 */
    dragStartY: 0,

    /** @type {number} X轴平移距离 */
    translateX: 0,

    /** @type {number} Y轴平移距离 */
    translateY: 0,

    /** @type {number} 最小缩放比例 */
    MIN_ZOOM: 0.5,

    /** @type {number} 最大缩放比例 */
    MAX_ZOOM: 5,

    /** @type {number} 缩放步长 */
    ZOOM_STEP: 0.25,

    /** @type {number} 滚轮缩放灵敏度 */
    WHEEL_SENSITIVITY: 0.001,

    /**
     * 初始化图片查看器
     * @method initialize
     */
    initialize() {
        // Bind keyboard event for closing
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.close();
        });
    },

    /**
     * 打开图片查看器
     * @method open
     * @param {string} imageSrc - 图片URL
     */
    open(imageSrc) {
        const modal = document.getElementById('imageModal');
        const image = document.getElementById('modalImage');
        const caption = document.getElementById('modalCaption');
        const wrapper = document.querySelector('.image-modal-wrapper');

        if (!modal || !image) return;

        // Set image source
        image.src = imageSrc;

        // Reset transform
        this.resetTransform();

        // Get caption from original image
        const originalImage = document.querySelector(`img[src="${imageSrc}"]`);
        const captionText = originalImage?.nextElementSibling?.textContent || '';
        caption.textContent = captionText;

        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Bind events
        this.bindModalEvents(modal, wrapper, image);
    },

    /**
     * 关闭图片查看器
     * @method close
     */
    close() {
        const modal = document.getElementById('imageModal');
        const wrapper = document.querySelector('.image-modal-wrapper');

        if (!modal) return;

        modal.style.display = 'none';
        document.body.style.overflow = '';

        this.unbindModalEvents(wrapper);
    },

    /**
     * 绑定模态框事件
     * @method bindModalEvents
     * @param {HTMLElement} modal - 模态框元素
     * @param {HTMLElement} wrapper - 图片包装器
     * @param {HTMLElement} image - 图片元素
     */
    bindModalEvents(modal, wrapper, image) {
        // Click outside to close
        modal.addEventListener('click', (event) => {
            if (event.target === modal) this.close();
        });

        // Mouse drag
        wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Wheel zoom - Figma style (zoom at mouse position)
        wrapper.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Prevent default drag
        image.addEventListener('dragstart', (event) => event.preventDefault());
    },

    /**
     * 解绑模态框事件
     * @method unbindModalEvents
     * @param {HTMLElement} wrapper - 图片包装器
     */
    unbindModalEvents(wrapper) {
        if (!wrapper) return;

        wrapper.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        wrapper.removeEventListener('wheel', this.handleWheel);
    },

    /**
     * 重置变换
     * @method resetTransform
     */
    resetTransform() {
        this.currentZoom = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.updateImageTransform();
    },

    /**
     * 处理鼠标按下
     * @method handleMouseDown
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseDown(event) {
        if (event.button !== 0) return; // Only left click

        this.isDragging = true;
        this.dragStartX = event.clientX - this.translateX;
        this.dragStartY = event.clientY - this.translateY;

        const wrapper = document.querySelector('.image-modal-wrapper');
        if (wrapper) wrapper.style.cursor = 'grabbing';
    },

    /**
     * 处理鼠标移动
     * @method handleMouseMove
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        if (!this.isDragging) return;

        event.preventDefault();
        this.translateX = event.clientX - this.dragStartX;
        this.translateY = event.clientY - this.dragStartY;
        this.updateImageTransform();
    },

    /**
     * 处理鼠标松开
     * @method handleMouseUp
     */
    handleMouseUp() {
        this.isDragging = false;
        const wrapper = document.querySelector('.image-modal-wrapper');
        if (wrapper) wrapper.style.cursor = 'grab';
    },

    /**
     * 处理滚轮缩放 - Figma风格：以鼠标位置为中心缩放
     * @method handleWheel
     * @param {WheelEvent} event - 滚轮事件
     */
    handleWheel(event) {
        event.preventDefault();

        const wrapper = document.querySelector('.image-modal-wrapper');
        const image = document.getElementById('modalImage');
        if (!wrapper || !image) return;

        // 计算缩放因子
        const delta = -event.deltaY * this.WHEEL_SENSITIVITY;
        const zoomFactor = Math.exp(delta);

        // 计算新的缩放比例
        const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.currentZoom * zoomFactor));

        // 获取wrapper的边界信息
        const wrapperRect = wrapper.getBoundingClientRect();

        // 计算鼠标相对于wrapper中心的位置
        const mouseX = event.clientX - wrapperRect.left;
        const mouseY = event.clientY - wrapperRect.top;

        // 计算鼠标相对于图片当前位置的位置（考虑当前的平移和缩放）
        const imageX = (mouseX - wrapperRect.width / 2 - this.translateX) / this.currentZoom;
        const imageY = (mouseY - wrapperRect.height / 2 - this.translateY) / this.currentZoom;

        // 计算缩放比例的变化
        const scaleRatio = newZoom / this.currentZoom;

        // 调整平移量，使鼠标指向的点保持不动
        this.translateX = this.translateX - imageX * (scaleRatio - 1) * this.currentZoom;
        this.translateY = this.translateY - imageY * (scaleRatio - 1) * this.currentZoom;

        // 更新缩放比例
        this.currentZoom = newZoom;

        // 应用变换
        this.updateImageTransform();
    },

    /**
     * 放大图片（以屏幕中心为缩放中心）
     * @method zoomIn
     */
    zoomIn() {
        const newZoom = Math.min(this.currentZoom + this.ZOOM_STEP, this.MAX_ZOOM);
        this.zoomAtCenter(newZoom);
    },

    /**
     * 缩小图片（以屏幕中心为缩放中心）
     * @method zoomOut
     */
    zoomOut() {
        const newZoom = Math.max(this.currentZoom - this.ZOOM_STEP, this.MIN_ZOOM);
        this.zoomAtCenter(newZoom);
    },

    /**
     * 以屏幕中心为缩放中心进行缩放
     * @method zoomAtCenter
     * @param {number} newZoom - 新的缩放比例
     */
    zoomAtCenter(newZoom) {
        const wrapper = document.querySelector('.image-modal-wrapper');
        if (!wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();

        // 屏幕中心相对于wrapper的位置
        const centerX = wrapperRect.width / 2;
        const centerY = wrapperRect.height / 2;

        // 计算中心点相对于图片当前位置的位置
        const imageX = (centerX - wrapperRect.width / 2 - this.translateX) / this.currentZoom;
        const imageY = (centerY - wrapperRect.height / 2 - this.translateY) / this.currentZoom;

        // 计算缩放比例的变化
        const scaleRatio = newZoom / this.currentZoom;

        // 调整平移量，使中心点保持不动
        this.translateX = this.translateX - imageX * (scaleRatio - 1) * this.currentZoom;
        this.translateY = this.translateY - imageY * (scaleRatio - 1) * this.currentZoom;

        // 更新缩放比例
        this.currentZoom = newZoom;

        // 应用变换
        this.updateImageTransform();
    },

    /**
     * 更新图片变换
     * @method updateImageTransform
     */
    updateImageTransform() {
        const image = document.getElementById('modalImage');
        if (image) {
            image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentZoom})`;
        }
    }
};

// =============================================================================
// Icon System - SVG图标系统
// =============================================================================

/**
 * @namespace IconSystem
 * @description SVG图标系统，将Emoji替换为SVG图标
 */
const IconSystem = {
    /** @type {Object} 图标映射表 */
    iconMap: {
        '📱': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
        '📘': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        '📋': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
        '🔣': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
        '🔍': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '👥': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        '📞': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
        '📲': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line><path d="M8 11l4 4 4-4"></path></svg>',
        '🖼️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
        '🎙️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
        '🔋': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>',
        '🔦': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-6 6-6-6"></path><path d="M12 12v8"></path><path d="M8 20h8"></path></svg>',
        '🧹': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M15 9l-5 5-5-5"></path></svg>',
        '🗺️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>',
        '🚌': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="6" y1="18" x2="6" y2="21"></line><line x1="18" y1="18" x2="18" y2="21"></line></svg>',
        '🏪': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        '📷': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
        '📸': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle><line x1="12" y1="13" x2="12" y2="13"></line></svg>',
        '💬': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
        '🔕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',
        '🚫': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>',
        '📹': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
        '🧧': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
        '💳': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
        '💰': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        '🛡️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
        '🔒': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        '⚠️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        '🏛️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M8 21v-6h8v6"></path></svg>',
        '📖': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        '💡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.9.27-1.48.27-2.09A5.48 5.48 0 0 0 9.73 6.5C7.1 6.5 4.91 8.68 4.91 11.31c0 .61.09 1.19.27 2.09L2 18h20l-2.91-4z"></path><path d="M12 2v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 4.22l-1.42 1.42"></path></svg>',
        '🔊': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
        '🗑️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
        '👤': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        '🏃': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v6m0 0l4-4m-4 4l-4-4"></path><path d="M17 20l-4-8-4 8"></path><path d="M7 4v6m0 0l4-4m-4 4l-4-4"></path></svg>',
        '✕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    },
    
    /**
     * 初始化图标系统
     * @method initialize
     */
    initialize() {
        this.replaceEmojisWithSvgs();
    },
    
    /**
     * 将Emoji替换为SVG图标
     * @method replaceEmojisWithSvgs
     */
    replaceEmojisWithSvgs() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodesToReplace = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent;
            for (const [emoji, svg] of Object.entries(this.iconMap)) {
                if (text.includes(emoji)) {
                    nodesToReplace.push({ node, emoji, svg });
                    break;
                }
            }
        }
        
        nodesToReplace.forEach(({ node, emoji, svg }) => {
            const parent = node.parentNode;
            const text = node.textContent;
            const parts = text.split(emoji);
            
            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();
                parts.forEach((part, index) => {
                    fragment.appendChild(document.createTextNode(part));
                    if (index < parts.length - 1) {
                        const span = document.createElement('span');
                        span.className = 'icon-svg';
                        span.innerHTML = svg;
                        fragment.appendChild(span);
                    }
                });
                parent.replaceChild(fragment, node);
            }
        });
    }
};

// =============================================================================
// Global Exports - 全局导出
// =============================================================================

// =============================================================================
// Lazy Load Manager - 图片懒加载管理器
// =============================================================================

/**
 * @namespace LazyLoadManager
 * @description 图片懒加载管理器，使用 Intersection Observer API
 */
const LazyLoadManager = {
    /** @type {IntersectionObserver} 观察器实例 */
    observer: null,

    /**
     * 初始化懒加载管理器
     * @method initialize
     */
    initialize() {
        // 检查浏览器是否支持 Intersection Observer
        if (!('IntersectionObserver' in window)) {
            // 不支持则直接加载所有图片
            this.loadAllImages();
            return;
        }

        // 创建观察器
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.01
        });

        // 观察所有图片
        this.observeImages();
    },

    /**
     * 观察所有图片元素
     * @method observeImages
     */
    observeImages() {
        const images = document.querySelectorAll('img[data-src], .guide-image');

        images.forEach(img => {
            // 如果图片没有data-src，将src转移到data-src
            if (!img.dataset.src && img.src) {
                img.dataset.src = img.src;
                // 使用占位符或模糊背景
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.classList.add('lazy-image');
            }
            this.observer.observe(img);
        });
    },

    /**
     * 加载单个图片
     * @method loadImage
     * @param {HTMLImageElement} img - 图片元素
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 创建新图片对象预加载
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy-image');
            img.classList.add('lazy-loaded');
        };
        tempImg.onerror = () => {
            console.warn('Failed to load image:', src);
            img.classList.add('lazy-error');
        };
        tempImg.src = src;
    },

    /**
     * 加载所有图片（用于不支持 Intersection Observer 的浏览器）
     * @method loadAllImages
     */
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
};

// =============================================================================
// Global Exports - 全局导出
// =============================================================================

// Expose to global scope for inline event handlers
window.ApplicationController = ApplicationController;
window.ImageViewer = ImageViewer;
window.FontSizeController = FontSizeController;
window.IconSystem = IconSystem;
window.LazyLoadManager = LazyLoadManager;
window.APP_VERSION = APP_VERSION;
