/**
 * DataUsageTracker - Tracks data usage and resource loading for website analytics
 * Monitors network requests, resource sizes, and rendering completion
 */
class DataUsageTracker {
    constructor() {
        this.startTime = performance.now();
        this.resourceData = {
            totalBytes: 0,
            totalRequests: 0,
            resourceTypes: {},
            loadingComplete: false,
            renderingComplete: false,
            firstContentfulPaint: null,
            largestContentfulPaint: null
        };

        this.observers = [];
        this.isTracking = false;
        this.renderingCompleteTimeout = null;

        this.init();
    }

    /**
     * Initialize the data usage tracker
     */
    init() {
        console.log('DataUsageTracker: Initializing...');

        // Start monitoring immediately
        this.startTracking();

        // Track initial resources that may have already loaded
        this.trackExistingResources();

        // Set up performance observers
        this.setupPerformanceObservers();

        // Monitor for rendering completion
        this.monitorRenderingCompletion();

        console.log('DataUsageTracker: Initialized');
    }

    /**
     * Start tracking network requests
     */
    startTracking() {
        this.isTracking = true;

        // Override fetch to track network requests
        this.interceptFetch();

        // Track image loading
        this.trackImageLoading();

        // Track CSS and JS loading
        this.trackResourceLoading();
    }

    /**
     * Track resources that were already loaded before tracker init
     */
    trackExistingResources() {
        const entries = performance.getEntriesByType('resource');

        entries.forEach(entry => {
            this.processResourceEntry(entry);
        });

        console.log(`DataUsageTracker: Tracked ${entries.length} existing resources`);
    }

    /**
     * Set up Performance Observers for real-time monitoring
     */
    setupPerformanceObservers() {
        // Resource timing observer
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.processResourceEntry(entry);
                });
            });

            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(resourceObserver);

            // Navigation timing observer
            const navigationObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.processNavigationEntry(entry);
                });
            });

            navigationObserver.observe({ entryTypes: ['navigation'] });
            this.observers.push(navigationObserver);

            // Paint timing observer
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.processPaintEntry(entry);
                });
            });

            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(paintObserver);

            console.log('DataUsageTracker: Performance observers set up');
        }
    }

    /**
     * Process resource performance entry
     */
    processResourceEntry(entry) {
        if (!this.isTracking) return;

        const resourceSize = this.calculateResourceSize(entry);
        const resourceType = this.getResourceType(entry.name);

        // Update totals
        this.resourceData.totalBytes += resourceSize;
        this.resourceData.totalRequests++;

        // Update by type
        if (!this.resourceData.resourceTypes[resourceType]) {
            this.resourceData.resourceTypes[resourceType] = {
                bytes: 0,
                requests: 0,
                resources: []
            };
        }

        this.resourceData.resourceTypes[resourceType].bytes += resourceSize;
        this.resourceData.resourceTypes[resourceType].requests++;
        this.resourceData.resourceTypes[resourceType].resources.push({
            name: entry.name,
            size: resourceSize,
            duration: entry.duration,
            startTime: entry.startTime
        });

        console.log(`DataUsageTracker: ${resourceType} loaded - ${this.formatBytes(resourceSize)} (${entry.name})`);
    }

    /**
     * Process navigation performance entry
     */
    processNavigationEntry(entry) {
        if (entry.transferSize) {
            console.log(`DataUsageTracker: Navigation transfer size - ${this.formatBytes(entry.transferSize)}`);
        }
    }

    /**
     * Process paint timing entry
     */
    processPaintEntry(entry) {
        if (entry.name === 'first-contentful-paint') {
            this.resourceData.firstContentfulPaint = entry.startTime;
            console.log(`DataUsageTracker: First Contentful Paint - ${entry.startTime.toFixed(2)}ms`);
        }

        if (entry.name === 'largest-contentful-paint') {
            this.resourceData.largestContentfulPaint = entry.startTime;
            console.log(`DataUsageTracker: Largest Contentful Paint - ${entry.startTime.toFixed(2)}ms`);
        }
    }

    /**
     * Calculate resource size from performance entry
     */
    calculateResourceSize(entry) {
        // Try different size properties in order of preference
        if (entry.transferSize !== undefined && entry.transferSize > 0) {
            return entry.transferSize;
        }
        if (entry.encodedBodySize !== undefined && entry.encodedBodySize > 0) {
            return entry.encodedBodySize;
        }
        if (entry.decodedBodySize !== undefined && entry.decodedBodySize > 0) {
            return entry.decodedBodySize;
        }

        // Fallback: estimate based on resource type
        return this.estimateResourceSize(entry.name);
    }

    /**
     * Estimate resource size when not available in performance entry
     */
    estimateResourceSize(url) {
        const extension = url.split('.').pop()?.toLowerCase();

        const estimates = {
            'css': 50000,    // 50KB average
            'js': 100000,    // 100KB average
            'jpg': 200000,   // 200KB average
            'jpeg': 200000,
            'png': 150000,   // 150KB average
            'gif': 100000,
            'webp': 100000,
            'svg': 10000,    // 10KB average
            'woff': 50000,   // 50KB average
            'woff2': 40000,
            'ttf': 80000,
            'eot': 60000
        };

        return estimates[extension] || 25000; // 25KB default
    }

    /**
     * Determine resource type from URL
     */
    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase();

        const typeMap = {
            'css': 'stylesheet',
            'js': 'script',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'webp': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font',
            'eot': 'font',
            'json': 'data',
            'xml': 'data'
        };

        if (url.includes('googleapis.com') || url.includes('gstatic.com')) {
            return 'font';
        }

        if (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com') || url.includes('cdnjs.cloudflare.com')) {
            return extension === 'css' ? 'stylesheet' : 'script';
        }

        return typeMap[extension] || 'other';
    }

    /**
     * Intercept fetch requests to track data usage
     */
    interceptFetch() {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = async function (...args) {
            const response = await originalFetch.apply(this, args);

            if (self.isTracking && response.ok) {
                const url = args[0];
                const contentLength = response.headers.get('content-length');

                if (contentLength) {
                    const size = parseInt(contentLength);
                    const resourceType = self.getResourceType(url);

                    self.resourceData.totalBytes += size;
                    self.resourceData.totalRequests++;

                    if (!self.resourceData.resourceTypes[resourceType]) {
                        self.resourceData.resourceTypes[resourceType] = {
                            bytes: 0,
                            requests: 0,
                            resources: []
                        };
                    }

                    self.resourceData.resourceTypes[resourceType].bytes += size;
                    self.resourceData.resourceTypes[resourceType].requests++;
                    self.resourceData.resourceTypes[resourceType].resources.push({
                        name: url,
                        size: size,
                        method: 'fetch'
                    });

                    console.log(`DataUsageTracker: Fetch request - ${self.formatBytes(size)} (${url})`);
                }
            }

            return response;
        };
    }

    /**
     * Track image loading
     */
    trackImageLoading() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            if (img.complete) {
                // Image already loaded
                this.trackImageSize(img);
            } else {
                // Wait for image to load
                img.addEventListener('load', () => {
                    this.trackImageSize(img);
                });
            }
        });

        // Track dynamically added images
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'IMG') {
                        if (node.complete) {
                            this.trackImageSize(node);
                        } else {
                            node.addEventListener('load', () => {
                                this.trackImageSize(node);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Track image size
     */
    trackImageSize(img) {
        // This is an approximation - actual size would need server-side info
        const estimatedSize = img.naturalWidth * img.naturalHeight * 3; // RGB approximation

        console.log(`DataUsageTracker: Image loaded - ${this.formatBytes(estimatedSize)} (${img.src})`);
    }

    /**
     * Track CSS and JS resource loading
     */
    trackResourceLoading() {
        // This is handled by the performance observer, but we can add specific tracking here if needed
        console.log('DataUsageTracker: Resource loading tracking active');
    }

    /**
     * Monitor for rendering completion
     */
    monitorRenderingCompletion() {
        // Use multiple indicators to determine rendering completion
        this.checkRenderingCompletion();

        // Check periodically
        const checkInterval = setInterval(() => {
            if (this.resourceData.renderingComplete) {
                clearInterval(checkInterval);
                return;
            }

            this.checkRenderingCompletion();
        }, 1000);

        // Failsafe: mark as complete after 30 seconds
        setTimeout(() => {
            if (!this.resourceData.renderingComplete) {
                this.markRenderingComplete('timeout');
                clearInterval(checkInterval);
            }
        }, 30000);
    }

    /**
     * Check if rendering is complete
     */
    checkRenderingCompletion() {
        const now = performance.now();
        const timeSinceStart = now - this.startTime;

        // Consider rendering complete if:
        // 1. DOM is ready
        // 2. No recent network activity
        // 3. LCP has occurred
        // 4. Reasonable time has passed

        const domReady = document.readyState === 'complete';
        const lcpOccurred = this.resourceData.largestContentfulPaint !== null;
        const reasonableTime = timeSinceStart > 2000; // At least 2 seconds

        if (domReady && reasonableTime && !this.resourceData.renderingComplete) {
            // Clear any existing timeout
            if (this.renderingCompleteTimeout) {
                clearTimeout(this.renderingCompleteTimeout);
            }

            // Wait for 2 seconds of inactivity before marking complete
            this.renderingCompleteTimeout = setTimeout(() => {
                this.markRenderingComplete('inactivity');
            }, 2000);
        }
    }

    /**
     * Mark rendering as complete and generate report
     */
    markRenderingComplete(reason = 'automatic') {
        if (this.resourceData.renderingComplete) return;

        this.resourceData.renderingComplete = true;
        this.resourceData.loadingComplete = true;

        const completionTime = performance.now() - this.startTime;

        console.log(`DataUsageTracker: Rendering complete (${reason}) - ${completionTime.toFixed(2)}ms`);

        // Generate final report
        this.generateReport();

        // Send to analytics if available
        this.sendToAnalytics();
    }

    /**
     * Generate detailed usage report
     */
    generateReport() {
        const report = {
            totalDataUsage: this.formatBytes(this.resourceData.totalBytes),
            totalRequests: this.resourceData.totalRequests,
            loadingTime: (performance.now() - this.startTime).toFixed(2) + 'ms',
            firstContentfulPaint: this.resourceData.firstContentfulPaint ?
                this.resourceData.firstContentfulPaint.toFixed(2) + 'ms' : 'N/A',
            largestContentfulPaint: this.resourceData.largestContentfulPaint ?
                this.resourceData.largestContentfulPaint.toFixed(2) + 'ms' : 'N/A',
            resourceBreakdown: {}
        };

        // Add resource type breakdown
        Object.keys(this.resourceData.resourceTypes).forEach(type => {
            const typeData = this.resourceData.resourceTypes[type];
            report.resourceBreakdown[type] = {
                bytes: this.formatBytes(typeData.bytes),
                bytesRaw: typeData.bytes,
                requests: typeData.requests,
                percentage: ((typeData.bytes / this.resourceData.totalBytes) * 100).toFixed(1) + '%'
            };
        });

        console.group('📊 Website Data Usage Report');
        console.log('Total Data Downloaded:', report.totalDataUsage);
        console.log('Total Requests:', report.totalRequests);
        console.log('Total Loading Time:', report.loadingTime);
        console.log('First Contentful Paint:', report.firstContentfulPaint);
        console.log('Largest Contentful Paint:', report.largestContentfulPaint);
        console.log('Resource Breakdown:', report.resourceBreakdown);
        console.groupEnd();

        // Store report globally for access
        window.dataUsageReport = report;

        return report;
    }

    /**
     * Send data to analytics system
     */
    sendToAnalytics() {
        if (window.analyticsManager) {
            const analyticsData = {
                total_bytes: this.resourceData.totalBytes,
                total_requests: this.resourceData.totalRequests,
                loading_time_ms: performance.now() - this.startTime,
                first_contentful_paint: this.resourceData.firstContentfulPaint,
                largest_contentful_paint: this.resourceData.largestContentfulPaint,
                resource_types: {}
            };

            // Add resource type data
            Object.keys(this.resourceData.resourceTypes).forEach(type => {
                const typeData = this.resourceData.resourceTypes[type];
                analyticsData.resource_types[type] = {
                    bytes: typeData.bytes,
                    requests: typeData.requests
                };
            });

            window.analyticsManager.trackEvent('page_load_complete', analyticsData);
            console.log('DataUsageTracker: Sent data to analytics');
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get current data usage summary
     */
    getCurrentUsage() {
        return {
            totalBytes: this.resourceData.totalBytes,
            totalBytesFormatted: this.formatBytes(this.resourceData.totalBytes),
            totalRequests: this.resourceData.totalRequests,
            loadingTime: performance.now() - this.startTime,
            isComplete: this.resourceData.renderingComplete,
            resourceTypes: this.resourceData.resourceTypes
        };
    }

    /**
     * Stop tracking and cleanup
     */
    stop() {
        this.isTracking = false;

        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });

        this.observers = [];

        console.log('DataUsageTracker: Stopped tracking');
    }
}

// Initialize global data usage tracker
window.dataUsageTracker = new DataUsageTracker();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataUsageTracker;
}