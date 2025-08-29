// Mr. Alien Analytics Client
// Real-time analytics tracking with MySQL backend

class MrAlienAnalytics {
    constructor(apiUrl = './api/analytics.php') {
        this.apiUrl = apiUrl;
        this.visitorId = null;
        this.sessionId = null;
        this.isInitialized = false;
        this.heartbeatInterval = null;
        this.statsUpdateInterval = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        try {
            
            // Track visitor and get session
            await this.trackVisitor();
            
            // Track initial page view
            await this.trackPageView();
            
            // Fetch and animate initial stats from 0
            await this.loadInitialStats();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
        } catch (error) {
            // Silent fail
        }
    }
    
    async loadInitialStats() {
        // Wait 3 seconds for initial fetch
        setTimeout(async () => {
            const stats = await this.getRealTimeStats();
            if (stats) {
                this.updateStatsDisplay(stats);
            }
        }, 3000);
    }
    
    async trackVisitor() {
        try {
            // Check if we already have a session for this browser session
            const existingVisitorId = sessionStorage.getItem('mr_alien_visitor_id');
            const existingSessionId = sessionStorage.getItem('mr_alien_session_id');
            
            if (existingVisitorId && existingSessionId) {
                // Use existing session
                this.visitorId = existingVisitorId;
                this.sessionId = existingSessionId;
                return;
            }
            
            const response = await fetch(`${this.apiUrl}?action=track_visitor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page_url: window.location.href,
                    page_title: document.title,
                    referrer: document.referrer,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.visitorId = data.visitor_id;
                this.sessionId = data.session_id;
                
                // Store in sessionStorage for consistency
                sessionStorage.setItem('mr_alien_visitor_id', this.visitorId);
                sessionStorage.setItem('mr_alien_session_id', this.sessionId);
                
            } else {
                throw new Error(data.error || 'Failed to track visitor');
            }
            
        } catch (error) {
            // Silent fail
            // Fallback to stored IDs if available
            this.visitorId = sessionStorage.getItem('mr_alien_visitor_id');
            this.sessionId = sessionStorage.getItem('mr_alien_session_id');
        }
    }
    
    async trackPageView(customData = {}) {
        if (!this.visitorId || !this.sessionId) return;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=track_page_view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    visitor_id: this.visitorId,
                    session_id: this.sessionId,
                    page_url: window.location.href,
                    page_title: document.title,
                    referrer: document.referrer,
                    ...customData
                })
            });
            
            const data = await response.json();
            
            // Page view tracked
            
        } catch (error) {
            // Silent fail
        }
    }
    
    async trackEvent(eventType, eventName, eventData = {}) {
        if (!this.visitorId || !this.sessionId) return;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=track_event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    visitor_id: this.visitorId,
                    session_id: this.sessionId,
                    event_type: eventType,
                    event_name: eventName,
                    event_data: {
                        timestamp: new Date().toISOString(),
                        page_url: window.location.href,
                        ...eventData
                    }
                })
            });
            
            const data = await response.json();
            
            // Event tracked
            
        } catch (error) {
            // Silent fail
        }
    }
    
    async getRealTimeStats() {
        try {
            // Get user session info for personalized fuel display
            let queryParams = 'action=stats';
            
            // Check if user is logged in as premium
            if (window.userSupporterAccess && window.userSupporterAccess.userEmail && window.userSupporterAccess.accessLevel === 'premium') {
                queryParams += `&user_email=${encodeURIComponent(window.userSupporterAccess.userEmail)}&access_level=${window.userSupporterAccess.accessLevel}`;
            } else {
                // Fallback: check session/localStorage
                const supporterEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
                const supporterAccessLevel = sessionStorage.getItem('supporter_access_level') || localStorage.getItem('supporter_access_level');
                
                if (supporterEmail && supporterAccessLevel === 'premium') {
                    queryParams += `&user_email=${encodeURIComponent(supporterEmail)}&access_level=premium`;
                }
            }
            
            const response = await fetch(`${this.apiUrl}?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                return data.stats;
            } else {
                throw new Error(data.error || 'Failed to get stats');
            }
            
        } catch (error) {
            return null;
        }
    }
    
    // Fuel metrics are now read-only from app_db.gemini_credentials
    // No manual updates needed - data comes from real database
    
    startRealTimeUpdates() {
        // Update stats every 15 seconds after initial load
        this.statsUpdateInterval = setInterval(async () => {
            const stats = await this.getRealTimeStats();
            if (stats) {
                this.updateStatsDisplay(stats);
            }
        }, 15000);
        
        // Send heartbeat every 30 seconds to keep session active
        this.heartbeatInterval = setInterval(() => {
            this.trackEvent('system', 'heartbeat', {
                active_time: Date.now() - this.sessionStartTime
            });
        }, 30000);
        
        this.sessionStartTime = Date.now();
    }
    
    updateStatsDisplay(stats) {
        // Update total visitors
        const totalVisitorsEl = document.getElementById('total-visitors');
        if (totalVisitorsEl) {
            this.animateCounter(totalVisitorsEl, stats.total_visitors || 0);
        }
        
        // Update active users
        const activeUsersEl = document.getElementById('active-users');
        if (activeUsersEl) {
            this.animateCounter(activeUsersEl, stats.active_users || 0);
        }
        
        // Update today visitors
        const todayVisitorsEl = document.getElementById('last-24h');
        if (todayVisitorsEl) {
            this.animateCounter(todayVisitorsEl, stats.today_visitors || 0);
        }
        
        // Update AI Request stats
        this.updateAIRequestDisplay(stats);
        
        // Update fuel metrics
        this.updateFuelDisplay(stats);
        
    }
    
    updateAIRequestDisplay(stats) {
        // Update total AI requests
        const aiRequestsTotalEl = document.getElementById('ai-requests-total');
        if (aiRequestsTotalEl) {
            this.animateCounter(aiRequestsTotalEl, stats.ai_requests_total || 0);
        }
        
        // Update tooltip breakdown values - Status
        const tooltipPendingEl = document.getElementById('tooltip-pending');
        if (tooltipPendingEl) {
            tooltipPendingEl.textContent = stats.ai_requests_pending || 0;
        }
        
        const tooltipCompletedEl = document.getElementById('tooltip-completed');
        if (tooltipCompletedEl) {
            tooltipCompletedEl.textContent = stats.ai_requests_completed || 0;
        }
        
        // Update tooltip breakdown values - Type
        const tooltipVideoEl = document.getElementById('tooltip-video');
        if (tooltipVideoEl) {
            tooltipVideoEl.textContent = stats.ai_requests_video || 0;
        }
        
        const tooltipImageEl = document.getElementById('tooltip-image');
        if (tooltipImageEl) {
            tooltipImageEl.textContent = stats.ai_requests_image || 0;
        }
    }

    updateFuelDisplay(stats) {
        const fuelActiveEl = document.getElementById('fuel-active');
        const fuelExpiredEl = document.getElementById('fuel-expired');
        const fuelActivePremiumEl = document.getElementById('fuel-active-premium');
        
        if (fuelActiveEl) {
            this.animateCounter(fuelActiveEl, stats.fuel_active || 0);
        }
        if (fuelExpiredEl) {
            this.animateCounter(fuelExpiredEl, stats.fuel_expired || 0);
        }
        if (fuelActivePremiumEl) {
            this.animateCounter(fuelActivePremiumEl, stats.fuel_active_premium || 0);
        }
        
        // Update fuel premium label based on user status
        const fuelPremiumLabel = document.getElementById('fuel-premium-label');
        if (fuelPremiumLabel) {
            const isPremiumUser = (window.userSupporterAccess && window.userSupporterAccess.accessLevel === 'premium') ||
                                (sessionStorage.getItem('supporter_access_level') === 'premium') ||
                                (localStorage.getItem('supporter_access_level') === 'premium');
            
            if (isPremiumUser) {
                fuelPremiumLabel.textContent = 'My Premium';
            } else {
                fuelPremiumLabel.textContent = 'Active Premium';
            }
        }
        
        // Update fuel status alert
        this.updateFuelStatus(stats.fuel_active || 0, stats.fuel_active_premium || 0);
        
        // Update total fuel if element exists
        const fuelTotalEl = document.getElementById('fuel-total');
        if (fuelTotalEl && stats.fuel_total) {
            this.animateCounter(fuelTotalEl, stats.fuel_total);
        }
    }
    
    updateFuelStatus(activeFuel, soonExpired = 0) {
        const fuelAlertElement = document.getElementById('fuel-alert');
        if (!fuelAlertElement) return;
        
        // Show warning only when: (soon expired > 0) AND (active - soon expired == 0)
        if (soonExpired > 0 && (activeFuel - soonExpired) === 0) {
            fuelAlertElement.className = 'glass-effect rounded-lg p-3 border-l-4 border-yellow-400 bg-yellow-900 bg-opacity-20';
            fuelAlertElement.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="alert-circle" class="w-5 h-5 text-yellow-400 mr-2"></i>
                    <span class="text-yellow-300 text-xs">Low fuel! Consider supporting to maintain optimal performance.</span>
                </div>
            `;
        } else if (activeFuel === 0) {
            fuelAlertElement.className = 'glass-effect rounded-lg p-3 border-l-4 border-red-400 bg-red-900 bg-opacity-20';
            fuelAlertElement.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 mr-2"></i>
                    <span class="text-red-300 text-xs">No fuel available! Tools need more time. Please support to keep fuel available.</span>
                </div>
            `;
        } else {
            fuelAlertElement.className = 'glass-effect rounded-lg p-3 border-l-4 border-green-400 bg-green-900 bg-opacity-20';
            fuelAlertElement.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="check-circle" class="w-5 h-5 text-green-400 mr-2"></i>
                    <span class="text-green-300 text-xs">Tools are running smoothly!</span>
                </div>
            `;
        }
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        
        if (currentValue !== targetValue) {
            const duration = 1500; // 1.5 seconds
            const steps = 30;
            const stepValue = (targetValue - currentValue) / steps;
            const stepDuration = duration / steps;
            let currentStep = 0;
            
            const timer = setInterval(() => {
                currentStep++;
                const newValue = Math.round(currentValue + (stepValue * currentStep));
                
                if (currentStep >= steps) {
                    element.textContent = targetValue.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = newValue.toLocaleString();
                }
            }, stepDuration);
        }
    }
    
    setupEventListeners() {
        // Track AI app launches
        document.querySelectorAll('.app-card a, .launch-btn').forEach(link => {
            link.addEventListener('click', (e) => {
                const appName = e.target.closest('.app-card')?.querySelector('h3')?.textContent || 'Unknown App';
                this.trackEvent('app_launch', appName, {
                    app_url: e.target.href,
                    click_position: { x: e.clientX, y: e.clientY }
                });
            });
        });
        
        // Track support button clicks
        document.querySelectorAll('button, .support-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = e.target.textContent.trim();
                this.trackEvent('support_click', buttonText, {
                    button_type: e.target.className,
                    click_position: { x: e.clientX, y: e.clientY }
                });
            });
        });
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollDepth)) {
                    this.trackEvent('scroll', `${scrollDepth}%`, {
                        scroll_depth: scrollDepth,
                        page_height: document.body.scrollHeight
                    });
                }
            }
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('page_visibility', document.hidden ? 'hidden' : 'visible', {
                timestamp: new Date().toISOString()
            });
        });
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload', 'beforeunload', {
                session_duration: Date.now() - this.sessionStartTime,
                max_scroll_depth: maxScrollDepth
            });
        });
    }
    
    // Public methods for manual tracking
    trackAppLaunch(appName, appUrl) {
        this.trackEvent('app_launch', appName, { app_url: appUrl });
    }
    
    trackSupportAction(actionType, amount = null) {
        this.trackEvent('support_action', actionType, { amount: amount });
    }
    
    trackCustomEvent(category, action, data = {}) {
        this.trackEvent(category, action, data);
    }
    
    // Cleanup method
    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
    }
}

// Initialize analytics
window.MrAlienAnalytics = new MrAlienAnalytics();

// Export for manual usage
window.trackEvent = (category, action, data) => {
    if (window.MrAlienAnalytics && window.MrAlienAnalytics.isInitialized) {
        window.MrAlienAnalytics.trackCustomEvent(category, action, data);
    }
};


