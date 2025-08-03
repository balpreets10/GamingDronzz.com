/**
 * Fixed Image Manager - Strategy 1 lazy loading with proper implementation
 */
class ImageManager {
    constructor() {
        this.breakpoints = {
            xs: 576,
            sm: 768,
            md: 992,
            lg: 1200,
            xl: 1400
        };

        this.imageFormats = ['webp', 'jpg', 'png'];
        this.lazyLoadEnabled = true;
        this.processedImages = new Set();
        this.lazyImageObserver = null;

        this.init();
    }

    init() {
        this.setupLazyLoading();
        console.log('ImageManager initialized with lazy loading');
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported - loading all images immediately');
            this.loadAllImagesImmediately();
            return;
        }

        this.lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyImage(entry.target);
                    this.lazyImageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px', // Start loading 100px before entering viewport
            threshold: 0.01
        });

        console.log('Lazy loading observer created');
    }

    loadLazyImage(element) {
        if (element.classList.contains('lazy-bg')) {
            // Handle background images (project cards)
            const bgSrc = element.getAttribute('data-bg-src');
            if (bgSrc && element.getAttribute('data-bg-loaded') === 'false') {
                console.log('Loading lazy background image:', bgSrc);

                const img = new Image();
                img.onload = () => {
                    element.style.backgroundImage = `url('${bgSrc}')`;
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                    element.setAttribute('data-bg-loaded', 'true');
                    element.classList.add('image-loaded');

                    const placeholder = element.querySelector('.image-placeholder');
                    if (placeholder) {
                        placeholder.style.opacity = '0';
                        setTimeout(() => {
                            if (placeholder.parentNode) {
                                placeholder.remove();
                            }
                        }, 300);
                    }

                    console.log('Background image loaded successfully:', bgSrc);
                };

                img.onerror = () => {
                    console.error('Failed to load background image:', bgSrc);
                    element.setAttribute('data-bg-loaded', 'error');

                    const placeholder = element.querySelector('.image-placeholder');
                    if (placeholder) {
                        placeholder.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
                        placeholder.style.color = 'var(--error-color)';
                    }
                };

                img.src = bgSrc;
            }
        } else if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
            // Handle regular images
            const src = element.getAttribute('data-src');
            if (src) {
                console.log('Loading lazy image:', src);

                const tempImg = new Image();
                tempImg.onload = () => {
                    element.src = src;
                    element.removeAttribute('data-src');
                    element.classList.remove('lazy-image');
                    element.classList.add('image-loaded');
                    console.log('Regular image loaded successfully:', src);
                };

                tempImg.onerror = () => {
                    console.error('Failed to load image:', src);
                    element.alt = 'Failed to load image';
                };

                tempImg.src = src;
            }
        }
    }

    observeLazyImages() {
        if (!this.lazyImageObserver) {
            console.warn('Lazy image observer not available');
            this.loadAllImagesImmediately();
            return;
        }

        // Find all unloaded lazy background images
        const lazyBgImages = document.querySelectorAll('.lazy-bg[data-bg-loaded="false"]');

        // Find all unloaded lazy regular images
        const lazyImages = document.querySelectorAll('img[data-src]');

        console.log(`Found ${lazyBgImages.length} lazy background images and ${lazyImages.length} lazy regular images to observe`);

        lazyBgImages.forEach(img => {
            this.lazyImageObserver.observe(img);
        });

        lazyImages.forEach(img => {
            this.lazyImageObserver.observe(img);
        });

        // Force immediate loading if no images found (fallback)
        if (lazyBgImages.length === 0 && lazyImages.length === 0) {
            console.log('No lazy images found - checking for immediate loading needed');
            setTimeout(() => {
                this.loadAllImagesImmediately();
            }, 100);
        }
    }

    loadAllImagesImmediately() {
        console.log('Loading all images immediately as fallback');

        // Load all lazy background images
        const lazyBgImages = document.querySelectorAll('.lazy-bg[data-bg-loaded="false"]');
        lazyBgImages.forEach(element => {
            this.loadLazyImage(element);
        });

        // Load all lazy regular images
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(element => {
            this.loadLazyImage(element);
        });
    }

    async loadModalImages(project) {
        if (!project || !project.images) {
            throw new Error('Invalid project data for modal loading');
        }

        console.log(`Loading ${project.images.length} modal images for project: ${project.title}`);

        const imagePromises = project.images.map((src, index) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Modal image ${index + 1}/${project.images.length} loaded:`, src);
                    resolve(src);
                };
                img.onerror = () => {
                    console.error(`Failed to load modal image ${index + 1}:`, src);
                    reject(new Error(`Failed to load image: ${src}`));
                };
                img.src = this.smartUrl(src);
            });
        });

        try {
            const loadedImages = await Promise.all(imagePromises);
            console.log(`Successfully loaded all ${loadedImages.length} modal images`);
            return loadedImages;
        } catch (error) {
            console.error('Error loading modal images:', error);
            throw error;
        }
    }

    smartUrl(originalUrl) {
        return this.getOptimizedImageUrl(originalUrl, 'png');
    }

    getOptimizedImageUrl(originalUrl, format = 'png') {
        if (!originalUrl) return originalUrl;

        const screenWidth = window.innerWidth;
        const targetWidth = this.getTargetWidth(screenWidth);
        const { basePath, filename, extension } = this.parseImageUrl(originalUrl);

        return `${basePath}${targetWidth}/${filename}.${format}`;
    }

    getTargetWidth(screenWidth) {
        if (screenWidth <= this.breakpoints.xs) return this.breakpoints.xs;
        if (screenWidth <= this.breakpoints.sm) return this.breakpoints.sm;
        if (screenWidth <= this.breakpoints.md) return this.breakpoints.md;
        if (screenWidth <= this.breakpoints.lg) return this.breakpoints.lg;
        return this.breakpoints.lg;
    }

    parseImageUrl(url) {
        const lastSlash = url.lastIndexOf('/');
        const basePath = url.substring(0, lastSlash + 1);
        const filenameWithExt = url.substring(lastSlash + 1);
        const lastDot = filenameWithExt.lastIndexOf('.');

        const filename = filenameWithExt.substring(0, lastDot);
        const extension = filenameWithExt.substring(lastDot + 1);

        return { basePath, filename, extension };
    }

    createResponsiveImage(originalUrl, options = {}) {
        const config = {
            alt: options.alt || '',
            className: options.className || '',
            lazy: options.lazy !== false,
            sizes: options.sizes || this.getDefaultSizes(),
            formats: options.formats || this.imageFormats,
            ...options
        };

        const sources = this.generateImageSources(originalUrl, config);
        const pictureElement = this.createPictureElement(sources, originalUrl, config);

        return pictureElement;
    }

    generateImageSources(originalUrl, config) {
        const sources = [];
        const { basePath, filename, extension } = this.parseImageUrl(originalUrl);

        config.formats.forEach(format => {
            const breakpointSources = [];

            Object.entries(this.breakpoints).forEach(([key, width]) => {
                const responsiveUrl = this.buildResponsiveUrl(basePath, filename, extension, width, format);
                breakpointSources.push(`${responsiveUrl} ${width}w`);
            });

            sources.push({
                type: `image/${format}`,
                srcset: breakpointSources.join(', '),
                sizes: config.sizes
            });
        });

        return sources;
    }

    buildResponsiveUrl(basePath, filename, originalExt, width, format) {
        return `${basePath}${width}/${filename}.${format}`;
    }

    createPictureElement(sources, fallbackUrl, config) {
        const picture = document.createElement('picture');
        picture.className = config.className;

        sources.forEach(source => {
            const sourceEl = document.createElement('source');
            sourceEl.type = source.type;
            sourceEl.sizes = source.sizes;

            if (config.lazy) {
                sourceEl.setAttribute('data-srcset', source.srcset);
            } else {
                sourceEl.srcset = source.srcset;
            }

            picture.appendChild(sourceEl);
        });

        const img = document.createElement('img');
        img.alt = config.alt;
        img.className = 'responsive-image';

        if (config.lazy) {
            img.setAttribute('data-src', fallbackUrl);
            img.src = this.getPlaceholderImage();
            img.classList.add('lazy-image');

            if (this.lazyImageObserver) {
                this.lazyImageObserver.observe(img);
            }
        } else {
            img.src = fallbackUrl;
        }

        picture.appendChild(img);
        return picture;
    }

    getDefaultSizes() {
        return '(max-width: 576px) 100vw, (max-width: 768px) 90vw, (max-width: 992px) 80vw, (max-width: 1200px) 70vw, 60vw';
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
    }

    loadImage(img) {
        const picture = img.closest('picture');
        if (!picture) return;

        const sources = picture.querySelectorAll('source[data-srcset]');
        sources.forEach(source => {
            source.srcset = source.getAttribute('data-srcset');
            source.removeAttribute('data-srcset');
        });

        if (img.getAttribute('data-src')) {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.remove('lazy-image');
            img.classList.add('image-loaded');
        }
    }

    convertExistingImages(container = document, options = {}) {
        const containerEl = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!containerEl) return;

        const images = containerEl.querySelectorAll('img:not(.responsive-image):not(.skip-responsive)');
        let convertedCount = 0;

        images.forEach(img => {
            if (this.processedImages.has(img.src)) return;

            const config = {
                alt: img.alt,
                className: img.className,
                lazy: options.lazy !== false,
                ...options
            };

            try {
                const responsiveImage = this.createResponsiveImage(img.src, config);
                img.parentNode.replaceChild(responsiveImage, img);
                this.processedImages.add(img.src);
                convertedCount++;
            } catch (error) {
                console.warn(`Failed to convert image: ${img.src}`, error);
            }
        });

        console.log(`ImageManager: Converted ${convertedCount} images in container`);
        return convertedCount;
    }

    img(src, options = {}) {
        return this.createResponsiveImage(src, options);
    }

    getOptimizedUrl(originalUrl, format = 'webp') {
        const screenWidth = window.innerWidth;
        const targetWidth = this.getTargetWidth(screenWidth);
        const { basePath, filename, extension } = this.parseImageUrl(originalUrl);

        return this.buildResponsiveUrl(basePath, filename, extension, targetWidth, format);
    }

    preloadCriticalImages(urls) {
        urls.forEach(url => {
            const optimizedUrl = this.getOptimizedUrl(url);
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = optimizedUrl;
            document.head.appendChild(link);
        });
    }

    updateConfig(config) {
        if (config.breakpoints) {
            this.breakpoints = { ...this.breakpoints, ...config.breakpoints };
        }
        if (config.imageFormats) {
            this.imageFormats = config.imageFormats;
        }
        if (config.lazyLoadEnabled !== undefined) {
            this.lazyLoadEnabled = config.lazyLoadEnabled;
        }
    }

    getStats() {
        return {
            processedImages: this.processedImages.size,
            lazyLoadEnabled: this.lazyLoadEnabled,
            breakpoints: this.breakpoints,
            formats: this.imageFormats
        };
    }

    refreshLazyLoading() {
        this.observeLazyImages();
    }

    destroy() {
        if (this.lazyImageObserver) {
            this.lazyImageObserver.disconnect();
        }
        this.processedImages.clear();
    }
}

window.ImageManager = ImageManager;
window.imageManager = new ImageManager();