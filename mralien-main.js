// App Configuration
const appConfigs = {
    'home': {
        title: 'Mr. Alien - AI Apps Hub',
        subtitle: 'AI Apps Hub & Tools',
        description: 'Mr. Alien\'s AI Applications Hub - Software Engineer specializing in AI tools and solutions.',
        showBackNav: false,
    },
    'short-video-gen': {
        title: 'Short Video Generator - Mr. Alien AI Tools',
        subtitle: 'Short Video Generator',
        description: 'Generate short-form videos with AI - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'image-gen': {
        title: 'Image Generator - Mr. Alien AI Tools',
        subtitle: 'Image Generator',
        description: 'AI-powered image creation - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'story-prompt-gen': {
        title: 'Story Prompt Generator - Mr. Alien AI Tools',
        subtitle: 'Story Detail Prompt Generator',
        description: 'Create detailed story prompts with AI - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'long-video-gen': {
        title: 'Long Video Generator - Mr. Alien AI Tools',
        subtitle: 'Long Video Generator',
        description: 'Create long-form video content with AI - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'short-video-from-image': {
        title: 'Video from Image - Mr. Alien AI Tools',
        subtitle: 'Short Video Gen From Image',
        description: 'Generate video from a single image - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'video-with-narration': {
        title: 'Video with Narration - Mr. Alien AI Tools',
        subtitle: 'Create Video + Narasi',
        description: 'Generate video with AI narration - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'image-upscaler': {
        title: 'Image Upscaler - Mr. Alien AI Tools',
        subtitle: 'Image Upscaler',
        description: 'Upscale your images with AI - Mr. Alien\'s AI Applications Hub',
        showBackNav: true,
    },
    'recent-video-requests': {
        title: 'Recent Video Requests - Mr. Alien AI Tools',
        subtitle: 'Recent Created Video Requests',
        description: 'Browse all video generation requests with detailed information',
        showBackNav: true,
    },
    'my-video-history': {
        title: 'My Video History - Mr. Alien AI Tools',
        subtitle: 'My Video Generation History',
        description: 'Browse your personal video generation requests and results',
        showBackNav: true,
    },
    // Footer pages
    'tos': {
        title: 'Terms of Service - Mr. Alien AI Tools',
        subtitle: 'Terms of Service',
        description: 'Terms of Service for Mr. Alien AI Tools',
        showBackNav: true,
    },
    'disclaimer': {
        title: 'Disclaimer - Mr. Alien AI Tools',
        subtitle: 'Disclaimer',
        description: 'Disclaimer for Mr. Alien AI Tools',
        showBackNav: true,
    },
    'how-to-use': {
        title: 'How To Use - Mr. Alien AI Tools',
        subtitle: 'How To Use',
        description: 'Guide on how to use Mr. Alien AI Tools',
        showBackNav: true,
    }
};

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// Also initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Language Preference Logic ---
    const languageToggles = document.querySelectorAll('a.lang-toggle');
    const preferredLang = localStorage.getItem('preferredLang');
    const currentPath = window.location.search;

    // Function to handle language switching
    function setLanguage(lang) {
        localStorage.setItem('preferredLang', lang);
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page) {
            let newPage = page.replace(/^en\//, ''); // Remove en/ prefix if it exists
            if (lang === 'en') {
                window.location.search = `?page=en/${newPage}`;
            } else {
                window.location.search = `?page=${newPage}`;
            }
        }
    }

    // Redirect to preferred language if not already on it
    if (preferredLang === 'en' && !currentPath.includes('?page=en/')) {
        const urlParams = new URLSearchParams(currentPath);
        const page = urlParams.get('page');
        if (page && ['tos', 'disclaimer', 'how-to-use'].includes(page)) {
             window.location.search = `?page=en/${page}`;
        }
    }
    
    // Add click listeners to language toggle links only (not all footer links)
    languageToggles.forEach(link => {
        const urlParams = new URLSearchParams(link.search);
        const page = urlParams.get('page');
        if (page) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (page.startsWith('en/')) {
                    setLanguage('en');
                } else {
                    setLanguage('id');
                }
            });
        }
    });
    // --- End of Language Preference Logic ---
    
    // Load content based on URL parameter
    loadPageContent();
});

// Function to update duration options based on video type and user access level
function updateDurationOptionsForVideoType() {
    const videoType = document.getElementById('video-type');
    const videoDuration = document.getElementById('video-duration');
    
    if (!videoType || !videoDuration) return;
    
    const selectedType = videoType.value;
    const accessLevel = window.userSupporterAccess?.accessLevel || 'guest';
    const hasAccess = window.userSupporterAccess?.hasAccess || false;
    
    // Define allowed durations based on video type and access level
    let allowedDurations = [];
    
    if (selectedType === 'visual-only') {
        // Visual Only: same rules as before
        if (accessLevel === 'guest') {
            allowedDurations = ['8', '16', '24'];
        } else if (accessLevel === 'supporter') {
            allowedDurations = ['8', '16', '24', '40'];
        } else if (accessLevel === 'premium') {
            allowedDurations = ['8', '16', '24', '40', '64'];
        }
    } else if (selectedType === 'visual-audio') {
        // Visual + Audio: restricted rules
        if (accessLevel === 'guest') {
            allowedDurations = ['8']; // Guest only 8s for visual+audio
        } else if (accessLevel === 'supporter') {
            allowedDurations = ['8', '16', '24']; // Supporter up to 24s for visual+audio
        } else if (accessLevel === 'premium') {
            allowedDurations = ['8', '16', '24', '40', '64']; // Premium all options
        }
    }
    
    // Update duration options
    const options = videoDuration.querySelectorAll('option');
    options.forEach(option => {
        const value = option.value;
        
        if (allowedDurations.includes(value)) {
            option.disabled = false;
            option.classList.remove('text-gray-500');
            // Clean up the text
            if (value === '40') {
                option.textContent = '40 seconds';
            } else if (value === '64') {
                option.textContent = '64 seconds';
            }
        } else {
            option.disabled = true;
            option.classList.add('text-gray-500');
            
            // Add appropriate labels
            if (value === '40') {
                if (selectedType === 'visual-audio' && accessLevel === 'guest') {
                    option.textContent = '40 seconds (Supporter+ for Visual+Audio)';
                } else {
                    option.textContent = '40 seconds (Supporter Only)';
                }
            } else if (value === '64') {
                option.textContent = '64 seconds (Premium Only)';
            } else if (value === '24' && selectedType === 'visual-audio' && accessLevel === 'guest') {
                option.textContent = '24 seconds (Supporter+ for Visual+Audio)';
            } else if (value === '16' && selectedType === 'visual-audio' && accessLevel === 'guest') {
                option.textContent = '16 seconds (Supporter+ for Visual+Audio)';
            }
        }
    });
    
    // Check if current selection is still valid
    if (!allowedDurations.includes(videoDuration.value)) {
        videoDuration.value = allowedDurations[0] || '8'; // Reset to first allowed or 8s
    }
}

// Function to get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to load page content dynamically
function loadPageContent() {
    // Check for footer pages first (using 'page' parameter)
    const page = getUrlParameter('page');
    const app = getUrlParameter('app') || 'home';
    
    // Determine which page to load
    const currentPage = page || app;
    const config = appConfigs[currentPage] || appConfigs['home'];
    
    // Update page metadata
    document.getElementById('page-title').textContent = config.title;
    document.getElementById('page-description').setAttribute('content', config.description);
    document.getElementById('page-subtitle').textContent = config.subtitle;
    
    // Show/hide back navigation
    const backNav = document.getElementById('back-navigation');
    if (config.showBackNav) {
        backNav.classList.remove('hidden');
    } else {
        backNav.classList.add('hidden');
    }
    
    // Re-initialize Lucide icons after content load (PHP now handles content injection)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize app-specific functionality
    initializeAppFunctionality(currentPage);
    
    // Initialize refuel modal
    initializeRefuelModal();
    
    // Initialize supporter system
    initializeSupporterSystem();
}

// Function to initialize app-specific functionality
function initializeAppFunctionality(app) {
    if (app === 'short-video-gen') {
        initializeVideoGenerator();
    } else if (app === 'short-video-from-image') {
        initializeVideoFromImageGenerator();
    } else if (app === 'image-gen') {
        initializeImageGenerator();
    } else if (app === 'video-with-narration') {
        // Placeholder for future functionality
    } else if (app === 'image-upscaler') {
        // Placeholder for future functionality
    } else if (app === 'recent-video-requests') {
        initializeRecentVideoRequests();
    } else if (app === 'my-video-history') {
        initializeMyVideoHistory();
    }
    // Add more app initializations here as needed
}

// Video Generator functionality
function initializeVideoGenerator() {
    const generateBtn = document.getElementById('generate-video-btn');
    const videoPreview = document.getElementById('video-preview');
    const videoPrompt = document.getElementById('video-prompt');
    const videoDuration = document.getElementById('video-duration');
    const videoStyle = document.getElementById('video-style');
    const videoType = document.getElementById('video-type');
    const videoOrientation = document.getElementById('video-orientation');
    const charCount = document.getElementById('char-count');
    
    // Initialize rate limiting for video generation
    if (window.rateLimiter && generateBtn) {
        generateBtn.setAttribute('data-rate-limit-action', 'video_generation');
        
        // Show rate limit status on page load
        showVideoGenerationRateLimit();
    }
    
    // Status check elements
    const checkRequestIdInput = document.getElementById('check-request-id');
    const pasteRequestIdBtn = document.getElementById('paste-request-id');
    const checkStatusBtn = document.getElementById('check-status-btn');
    const statusCheckResult = document.getElementById('status-check-result');
    
    // Copy request ID functionality
    const copyRequestIdBtn = document.getElementById('copy-request-id');
    
    // Initialize status check functionality
    initializeStatusCheck();
    
    // Handle type selection and orientation dependency
    if (videoType && videoOrientation) {
        videoType.addEventListener('change', function() {
            const selectedType = this.value;
            const portraitOption = videoOrientation.querySelector('option[value="portrait"]');
            
            // Visual + Audio now supports both orientations, but default to landscape
            if (selectedType === 'visual-audio') {
                // Set default to landscape but allow portrait
                if (videoOrientation.value === '') {
                    videoOrientation.value = 'landscape';
                }
                portraitOption.disabled = false;
                portraitOption.style.color = '';
                portraitOption.textContent = 'Portrait';
            } else {
                // Enable portrait for visual only
                portraitOption.disabled = false;
                portraitOption.style.color = '';
                portraitOption.textContent = 'Portrait';
            }
            
            // Update duration options based on video type and user access
            updateDurationOptionsForVideoType();
        });
        
        // Initialize on page load
        videoType.dispatchEvent(new Event('change'));
        
        // Initialize duration options based on current access level
        updateDurationOptionsForVideoType();
    }
    
    // Action buttons
    const giveIdeaBtn = document.getElementById('give-idea-btn');
    const enhancePromptBtn = document.getElementById('enhance-prompt-btn');
    const randomPromptBtn = document.getElementById('random-prompt-btn');
    const clearPromptBtn = document.getElementById('clear-prompt-btn');
    
    // Handle duration selection validation
    if (videoDuration) {
        videoDuration.addEventListener('change', function() {
            const selectedValue = this.value;
            const selectedOption = this.options[this.selectedIndex];
            
            // Check if selected option is disabled (supporter only)
            if (selectedOption.disabled) {
                // Reset to default (8 seconds)
                this.value = '8';
                
                // Show supporter only message
                showSupporterOnlyMessage('Longer video durations are available for supporters only!');
            }
        });
        
        // Prevent clicking on disabled options
        videoDuration.addEventListener('mousedown', function(e) {
            const option = e.target;
            if (option.disabled) {
                e.preventDefault();
                showSupporterOnlyMessage('This duration requires supporter access!');
            }
            });
    }
    
    // Character counter
    if (videoPrompt && charCount) {
        videoPrompt.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count} characters`;
            
            // Change color based on length
            if (count < 50) {
                charCount.className = 'text-red-400';
            } else if (count < 150) {
                charCount.className = 'text-yellow-400';
            } else {
                charCount.className = 'text-green-400';
            }
        });
    }
    
    // Action button handlers
    if (giveIdeaBtn) {
        giveIdeaBtn.addEventListener('click', function() {
            showActionLoading(this, true);
            getAIVideoIdea();
        });
    }
    
    if (enhancePromptBtn) {
        enhancePromptBtn.addEventListener('click', function() {
            const videoPromptElement = document.getElementById('video-prompt');
            const currentPrompt = videoPromptElement ? videoPromptElement.value.trim() : '';
            
            if (!currentPrompt) {
                showTemporaryMessage('Please enter a description first to enhance it!', 'warning');
                return;
            }
            
            showActionLoading(this, true);
            getAIEnhancedPrompt(currentPrompt);
        });
    }
    
    if (randomPromptBtn) {
        randomPromptBtn.addEventListener('click', function() {
            showActionLoading(this, true);
            setTimeout(() => {
                const randomIdea = getRandomVideoIdea();
                if (videoPrompt) {
                    videoPrompt.value = randomIdea;
                    videoPrompt.dispatchEvent(new Event('input')); // Trigger char counter
                }
                showActionLoading(this, false);
            }, 800);
        });
    }
    
    if (clearPromptBtn) {
        clearPromptBtn.addEventListener('click', function() {
            if (videoPrompt) {
                videoPrompt.value = '';
                videoPrompt.dispatchEvent(new Event('input')); // Trigger char counter
                videoPrompt.focus();
            }
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            console.log('??¨ Generate button clicked!');
            
            try {
                const prompt = videoPrompt.value.trim();
                const duration = videoDuration ? videoDuration.value : '8';
                const style = videoStyle ? videoStyle.value : 'realistic';
                const type = videoType ? videoType.value : 'visual-only';
                const orientation = videoOrientation ? videoOrientation.value : 'landscape';
                
                console.log('??ù Form values:', { prompt, duration, style, type, orientation });
                
                // Validate prompt
                if (!prompt) {
                    console.log('‚ù? Validation failed: No prompt');
                    showTemporaryMessage('Please enter a video description', 'warning');
                    return;
                }
                
                if (prompt.length < 10) {
                    console.log('‚ù? Validation failed: Prompt too short');
                    showTemporaryMessage('Please provide a more detailed description (at least 10 characters)', 'warning');
                    return;
                }
                
                if (prompt.length > 7000) {
                    console.log('‚ù? Validation failed: Prompt too long');
                    showTemporaryMessage('Description is too long. Please keep it under 7000 characters', 'warning');
                    return;
                }
                
                // Validate duration based on video type and access level
                const accessLevel = window.userSupporterAccess?.accessLevel || 'guest';
                const hasAccess = window.userSupporterAccess?.hasAccess || false;
                
                if (type === 'visual-audio') {
                    // Visual + Audio has stricter duration limits
                    if (accessLevel === 'guest' && duration !== '8') {
                        showSupporterOnlyMessage('Guest users can only use 8s duration for Visual + Audio videos. Please upgrade to supporter for longer durations.');
                        return;
                    } else if (accessLevel === 'supporter' && !['8', '16', '24'].includes(duration)) {
                        showSupporterOnlyMessage('Supporter users can use up to 24s duration for Visual + Audio videos. Please upgrade to premium for longer durations.');
                        return;
                    } else if (accessLevel === 'premium' && !['8', '16', '24', '40', '64'].includes(duration)) {
                        showSupporterOnlyMessage('Invalid duration for Visual + Audio videos.');
                        return;
                    }
                } else {
                    // Visual Only - original validation
                    if (duration === '40') {
                        console.log('??? Checking supporter access for 40s duration...');
                        if (!hasAccess || (accessLevel !== 'supporter' && accessLevel !== 'premium')) {
                            console.log('‚ù? Supporter access required for 40s duration');
                            showSupporterOnlyMessage('40s duration requires supporter access! Please activate your supporter code or become a supporter.');
                            return;
                        }
                        logSupporterUsage('long_duration', `${duration}s`);
                    } else if (duration === '64') {
                        console.log('??? Checking premium access for 64s duration...');
                        if (!hasAccess || accessLevel !== 'premium') {
                            console.log('‚ù? Premium access required for 64s duration');
                            showSupporterOnlyMessage('64s duration requires premium access! Please upgrade to premium.');
                            return;
                        }
                        logSupporterUsage('premium_duration', `${duration}s`);
                    }
                }
                
                // Validate other fields
                if (!duration || !style || !type || !orientation) {
                    console.log('‚ù? Validation failed: Missing required fields');
                    showTemporaryMessage('Please fill in all required fields', 'warning');
                    return;
                }
                
                console.log('‚?? All validations passed, showing loading state...');
                
                // Show loading state
                showVideoLoading(true);
                
                console.log('??? Calling submitVideoRequest...');
                
                // Send request to n8n webhook
                submitVideoRequest(prompt, duration, style, type, orientation);
                
            } catch (error) {
                console.error('??• Error in generate button click handler:', error);
                showTemporaryMessage('An unexpected error occurred. Please try again.', 'error');
                showVideoLoading(false);
            }
        });
    } else {
        console.log('‚ù? Generate button not found!');
    }
}

// Video from Image Generator functionality
function initializeVideoFromImageGenerator() {
    console.log('??¨ Initializing Video from Image Generator');
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        const generateBtn = document.getElementById('generate-video-btn');
        const videoPreview = document.getElementById('video-preview');
        const videoPrompt = document.getElementById('video-prompt');
        const videoDuration = document.getElementById('video-duration');
        const videoType = document.getElementById('video-type');
        const videoOrientation = document.getElementById('video-orientation');
        const charCount = document.getElementById('char-count');
        const imageUpload = document.getElementById('image-upload');
        const imageUploadArea = document.getElementById('image-upload-area');
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        const imagePreview = document.getElementById('image-preview');
        const previewImage = document.getElementById('preview-image');
        const imageFilename = document.getElementById('image-filename');
        const removeImageBtn = document.getElementById('remove-image');
        
        console.log('??ç Elements found:', {
            generateBtn: !!generateBtn,
            imageUpload: !!imageUpload,
            imageUploadArea: !!imageUploadArea,
            uploadPlaceholder: !!uploadPlaceholder,
            imagePreview: !!imagePreview,
            previewImage: !!previewImage,
            imageFilename: !!imageFilename,
            removeImageBtn: !!removeImageBtn
        });
        
        let selectedImageFile = null;
        
        // Initialize rate limiting for image video generation (different from regular video generation)
        if (window.rateLimiter && generateBtn) {
            generateBtn.setAttribute('data-rate-limit-action', 'image_video_generation');
            showImageVideoGenerationRateLimit();
        }
        
        // Status check elements
        const checkRequestIdInput = document.getElementById('check-request-id');
        const pasteRequestIdBtn = document.getElementById('paste-request-id');
        const checkStatusBtn = document.getElementById('check-status-btn');
        const statusCheckResult = document.getElementById('status-check-result');
        
        // Copy request ID functionality
        const copyRequestIdBtn = document.getElementById('copy-request-id');
        
        // Initialize status check functionality
        initializeStatusCheck();
        
        // Handle type selection and orientation dependency
        if (videoType && videoOrientation) {
            videoType.addEventListener('change', function() {
                const selectedType = this.value;
                const portraitOption = videoOrientation.querySelector('option[value="portrait"]');
                
                // Visual + Audio now supports both orientations, but default to landscape
                if (selectedType === 'visual-audio') {
                    // Set default to landscape but allow portrait
                    if (videoOrientation.value === '') {
                        videoOrientation.value = 'landscape';
                    }
                    portraitOption.disabled = false;
                    portraitOption.style.color = '';
                    portraitOption.textContent = 'Portrait';
                } else {
                    // Enable portrait for visual only
                    portraitOption.disabled = false;
                    portraitOption.style.color = '';
                    portraitOption.textContent = 'Portrait';
                }
            });
            
            // Initialize on page load
            videoType.dispatchEvent(new Event('change'));
        }
        
        // Image upload functionality
        if (imageUpload && imageUploadArea) {
            console.log('??ºÔ∏è Initializing image upload functionality');
            
            // Click to upload
            imageUploadArea.addEventListener('click', (e) => {
                console.log('??Å Upload area clicked');
                e.preventDefault();
                imageUpload.click();
            });
            
            // Drag and drop events
            imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('??? Drag over');
                imageUploadArea.classList.add('border-purple-400', 'bg-purple-900', 'bg-opacity-10');
            });
            
            imageUploadArea.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('??? Drag enter');
                imageUploadArea.classList.add('border-purple-400', 'bg-purple-900', 'bg-opacity-10');
            });
            
            imageUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('??? Drag leave');
                // Only remove classes if we're leaving the upload area itself, not child elements
                if (!imageUploadArea.contains(e.relatedTarget)) {
                    imageUploadArea.classList.remove('border-purple-400', 'bg-purple-900', 'bg-opacity-10');
                }
            });
            
            imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('??Å Files dropped');
                imageUploadArea.classList.remove('border-purple-400', 'bg-purple-900', 'bg-opacity-10');
                
                const files = e.dataTransfer.files;
                console.log('??Å Dropped files:', files.length);
                if (files.length > 0) {
                    handleImageFile(files[0]);
                }
            });
            
            // File input change
            imageUpload.addEventListener('change', (e) => {
                console.log('??Å File input changed');
                if (e.target.files.length > 0) {
                    console.log('??Å Selected file:', e.target.files[0].name);
                    handleImageFile(e.target.files[0]);
                }
            });
            
            // Remove image button
            if (removeImageBtn) {
                removeImageBtn.addEventListener('click', (e) => {
                    console.log('???Ô∏è Remove image clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    clearImageUpload();
                });
            }
        } else {
            console.log('‚ù? Image upload elements not found:', {
                imageUpload: !!imageUpload,
                imageUploadArea: !!imageUploadArea
            });
        }
        
        // Handle image file selection
        function handleImageFile(file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showTemporaryMessage('Please upload a JPEG, PNG, or WebP image file', 'error');
                return;
            }
            
            // Validate file size (4MB)
            const maxSize = 4 * 1024 * 1024; // 4MB
            if (file.size > maxSize) {
                showTemporaryMessage('Image file must be smaller than 4MB', 'error');
                return;
            }
            
            selectedImageFile = file;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImage && imageFilename && uploadPlaceholder && imagePreview) {
                    previewImage.src = e.target.result;
                    imageFilename.textContent = file.name;
                    uploadPlaceholder.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(file);
        }
        
        // Clear image upload
        function clearImageUpload() {
            selectedImageFile = null;
            if (imageUpload) imageUpload.value = '';
            if (previewImage) previewImage.src = '';
            if (imageFilename) imageFilename.textContent = '';
            if (uploadPlaceholder) uploadPlaceholder.classList.remove('hidden');
            if (imagePreview) imagePreview.classList.add('hidden');
        }
        
        // Action buttons
        const giveIdeaBtn = document.getElementById('give-idea-btn');
        const enhancePromptBtn = document.getElementById('enhance-prompt-btn');
        const randomPromptBtn = document.getElementById('random-prompt-btn');
        const clearPromptBtn = document.getElementById('clear-prompt-btn');
        
        // Handle duration selection validation with different rules for image videos
        if (videoDuration && videoType) {
            // Function to update duration options based on user access and video type
            function updateDurationOptions() {
                const selectedType = videoType.value;
                const userAccessLevel = window.userSupporterAccess?.accessLevel || 'guest';
                
                console.log('??ß Image Video Duration Update:', {
                    selectedType,
                    userAccessLevel,
                    hasAccess: window.userSupporterAccess?.hasAccess
                });
                
                // Define allowed durations for image videos
                const allowedDurations = {
                    'guest': {
                        'visual-only': ['8', '16'],
                        'visual-audio': ['8']
                    },
                    'supporter': {
                        'visual-only': ['8', '16', '24', '32'],
                        'visual-audio': ['8', '16']
                    },
                    'premium': {
                        'visual-only': ['8', '16', '24', '32', '40', '64'],
                        'visual-audio': ['8', '16', '24', '32', '40']
                    }
                };
                
                const allowedForCurrentUser = allowedDurations[userAccessLevel]?.[selectedType] || allowedDurations['guest'][selectedType] || ['8'];
                
                console.log('??ß Allowed durations for current user:', allowedForCurrentUser);
                
                // Update all duration options
                Array.from(videoDuration.options).forEach(option => {
                    const value = option.value;
                    if (allowedForCurrentUser.includes(value)) {
                        option.disabled = false;
                        option.style.color = '';
                        option.textContent = option.textContent.replace(/ \(.*?\)$/, ''); // Remove any existing suffix
                        
                        // Restore original text for enabled options
                        if (value === '32') {
                            option.textContent = '32 seconds';
                        } else if (value === '40') {
                            option.textContent = '40 seconds';
                        } else if (value === '64') {
                            option.textContent = '64 seconds';
                        }
                    } else {
                        option.disabled = true;
                        option.style.color = '#6b7280';
                        if (!option.textContent.includes('(')) {
                            const requiredLevel = value === '64' || value === '40' ? 'Premium Only' : 
                                                value === '32' || value === '24' ? 'Supporter+' : 'Supporter Only';
                            option.textContent += ` (${requiredLevel})`;
                        }
                    }
                });
                
                // Check if current selection is still valid
                if (!allowedForCurrentUser.includes(videoDuration.value)) {
                    videoDuration.value = allowedForCurrentUser[1] || allowedForCurrentUser[0]; // Reset to second option (16s) or first if not available
                }
            }
            
            // Update options when video type changes
            videoType.addEventListener('change', updateDurationOptions);
            
            // Update options when supporter access changes
            window.addEventListener('supporterAccessUpdated', updateDurationOptions);
            
            // Also update when page loads with existing supporter access
            setTimeout(updateDurationOptions, 500);
            
            // Initial update
            updateDurationOptions();
            
            videoDuration.addEventListener('change', function() {
                const selectedValue = this.value;
                const selectedOption = this.options[this.selectedIndex];
                const selectedType = videoType.value;
                const userAccessLevel = window.userSupporterAccess?.accessLevel || 'guest';
                
                if (selectedOption.disabled) {
                    // Reset to appropriate default based on type
                    const defaultValue = selectedType === 'visual-audio' ? '8' : '16';
                    this.value = defaultValue;
                    
                    const requiredLevel = selectedValue === '64' || selectedValue === '40' ? 'Premium' : 'Supporter';
                    showSupporterOnlyMessage(`${selectedValue}s duration requires ${requiredLevel} access for ${selectedType} videos!`);
                }
            });
            
            videoDuration.addEventListener('mousedown', function(e) {
                const option = e.target;
                if (option.disabled) {
                    e.preventDefault();
                    const requiredLevel = option.value === '64' || option.value === '40' ? 'Premium' : 'Supporter';
                    showSupporterOnlyMessage(`This duration requires ${requiredLevel} access!`);
                }
            });
        }
        
        // Character counter
        if (videoPrompt && charCount) {
            videoPrompt.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = `${count} characters`;
                
                if (count < 50) {
                    charCount.className = 'text-red-400';
                } else if (count < 150) {
                    charCount.className = 'text-yellow-400';
                } else {
                    charCount.className = 'text-green-400';
                }
            });
        }
        
        // Action button handlers (reuse from video generator)
        if (giveIdeaBtn) {
            giveIdeaBtn.addEventListener('click', function() {
                showActionLoading(this, true);
                getAIVideoIdea();
            });
        }
        
        if (enhancePromptBtn) {
            enhancePromptBtn.addEventListener('click', function() {
                const currentPrompt = videoPrompt ? videoPrompt.value.trim() : '';
                
                if (!currentPrompt) {
                    showTemporaryMessage('Please enter a description first to enhance it!', 'warning');
                    return;
                }
                
                showActionLoading(this, true);
                getAIEnhancedPrompt(currentPrompt);
            });
        }
        
        if (randomPromptBtn) {
            randomPromptBtn.addEventListener('click', function() {
                showActionLoading(this, true);
                setTimeout(() => {
                    const randomIdea = getRandomImageVideoIdea();
                    if (videoPrompt) {
                        videoPrompt.value = randomIdea;
                        videoPrompt.dispatchEvent(new Event('input'));
                    }
                    showActionLoading(this, false);
                }, 800);
            });
        }
        
        if (clearPromptBtn) {
            clearPromptBtn.addEventListener('click', function() {
                if (videoPrompt) {
                    videoPrompt.value = '';
                    videoPrompt.dispatchEvent(new Event('input'));
                    videoPrompt.focus();
                }
            });
        }
        
        // Generate button handler
        if (generateBtn) {
            generateBtn.addEventListener('click', function() {
                console.log('??¨ Generate video from image button clicked!');
                
                try {
                    // Validate image upload
                    if (!selectedImageFile) {
                        showTemporaryMessage('Please upload an image first', 'warning');
                        return;
                    }
                    
                    const prompt = videoPrompt.value.trim();
                    const duration = videoDuration ? videoDuration.value : '16';
                    const type = videoType ? videoType.value : 'visual-only';
                    const orientation = videoOrientation ? videoOrientation.value : 'landscape';
                    
                    console.log('??ù Form values:', { prompt, duration, type, orientation, imageFile: selectedImageFile.name });
                    
                    // Validate prompt
                    if (!prompt) {
                        showTemporaryMessage('Please enter a video description', 'warning');
                        return;
                    }
                    
                    if (prompt.length < 10) {
                        showTemporaryMessage('Please provide a more detailed description (at least 10 characters)', 'warning');
                        return;
                    }
                    
                    if (prompt.length > 7000) {
                        showTemporaryMessage('Description is too long. Please keep it under 7000 characters', 'warning');
                        return;
                    }
                    
                    // Validate duration (supporter features)
                    if (duration === '40') {
                        if (!window.userSupporterAccess || !window.userSupporterAccess.hasAccess || 
                            (window.userSupporterAccess.accessLevel !== 'supporter' && window.userSupporterAccess.accessLevel !== 'premium')) {
                            showSupporterOnlyMessage('40s duration requires supporter access! Please activate your supporter code or become a supporter.');
                            return;
                        }
                        logSupporterUsage('long_duration', `${duration}s`);
                    } else if (duration === '64') {
                        if (!window.userSupporterAccess || !window.userSupporterAccess.hasAccess || 
                            window.userSupporterAccess.accessLevel !== 'premium') {
                            showSupporterOnlyMessage('64s duration requires premium access! Please upgrade to premium.');
                            return;
                        }
                        logSupporterUsage('premium_duration', `${duration}s`);
                    }
                    
                    console.log('‚?? All validations passed, showing loading state...');
                    
                    // Show loading state
                    showVideoLoading(true);
                    
                    console.log('??? Calling submitVideoFromImageRequest...');
                    
                    // Send request with image
                    submitVideoFromImageRequest(prompt, duration, type, orientation, selectedImageFile);
                    
                } catch (error) {
                    console.error('??• Error in generate button click handler:', error);
                    showTemporaryMessage('An unexpected error occurred. Please try again.', 'error');
                    showVideoLoading(false);
                }
            });
        }
    
        // Load recent requests for this page
        loadRecentRequests();
        
    }, 100); // Wait 100ms for DOM to be ready
}

// Image Generator functionality moved to separate file

// Get random video idea for image animation
function getRandomImageVideoIdea() {
    const imageAnimationIdeas = [
        "The image comes to life with gentle camera movement, creating a cinematic parallax effect with subtle depth and motion",
        "Elements in the image start moving naturally - water flows, leaves rustle, clouds drift across the sky",
        "A smooth zoom-in effect reveals hidden details while maintaining the original composition and mood",
        "The image transforms with dynamic lighting changes, creating dramatic shadows and highlights",
        "Objects in the image begin to animate with realistic physics - fabric flowing, hair moving in the wind",
        "The scene transitions from day to night or changes seasons while keeping the main subject intact",
        "A cinemagraph-style animation where only specific elements move while the rest remains still",
        "The image gains depth with a 2.5D effect, creating layers that move independently for a parallax view"
    ];
    return imageAnimationIdeas[Math.floor(Math.random() * imageAnimationIdeas.length)];
}


// Submit video from image request
async function submitVideoFromImageRequest(prompt, duration, type, orientation, imageFile) {
    console.log('??Ø submitVideoFromImageRequest called with:', { prompt, duration, type, orientation, imageFileName: imageFile.name });
    
    try {
        // Check rate limit before proceeding (different action for image videos)
        if (window.rateLimiter) {
            try {
                const rateLimitCheck = await window.rateLimiter.isAllowed('image_video_generation');
                if (!rateLimitCheck.allowed) {
                    window.rateLimiter.showRateLimitError(rateLimitCheck, 'image video generation');
                    return;
                }
            } catch (rateLimitError) {
                console.warn('‚?†Ô∏è Rate limiter check failed, proceeding anyway:', rateLimitError);
            }
        }
        
        // Get CSRF token
        console.log('??? Getting CSRF token...');
        const csrfToken = await getCSRFToken();
        
        if (!csrfToken) {
            throw new Error('Security token unavailable. Please refresh the page.');
        }
        
        // Prepare form data
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', prompt.trim());
        formData.append('duration', duration);
        formData.append('type', type);
        formData.append('orientation', orientation);
        formData.append('csrf_token', csrfToken);
        
        // Add user email if available for supporter access validation
        if (window.userSupporterAccess && window.userSupporterAccess.userEmail) {
            formData.append('user_email', window.userSupporterAccess.userEmail);
        } else {
            // Check session storage for supporter email
            const supporterEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
            if (supporterEmail) {
                formData.append('user_email', supporterEmail);
            }
        }
        
        // Add device fingerprint for enhanced rate limiting
        if (typeof DeviceFingerprinting !== 'undefined') {
            try {
                const fingerprint = await DeviceFingerprinting.collectFingerprint();
                formData.append('device_fingerprint', JSON.stringify(fingerprint));
                console.log('??ç Device fingerprint added for enhanced rate limiting');
            } catch (error) {
                console.warn('Failed to collect device fingerprint:', error);
            }
        }
        
        console.log('??? Sending request to api/video_image_proxy.php...');
        
        const response = await fetch('api/video_image_proxy.php', {
            method: 'POST',
            headers: {
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: formData
        });
        
        console.log('??° Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        // Get response text first
        const responseText = await response.text();
        
        if (!response.ok) {
            // Handle 400 Bad Request specifically for fuel validation errors
            if (response.status === 400) {
                try {
                    const errorData = JSON.parse(responseText);
                    if (errorData.error && errorData.error.includes('fuel')) {
                        throw new Error(errorData.error);
                    }
                    // If not fuel error, throw the actual error from server
                    throw new Error(errorData.error || `Server error (${response.status}): ${response.statusText}`);
                } catch (parseError) {
                    // Check if parseError is actually our fuel error that we threw
                    if (parseError.message && parseError.message.includes('fuel')) {
                        throw parseError; // Re-throw the fuel error
                    }
                    // If JSON parsing fails, throw generic error
                    throw new Error(`Server error (${response.status}): ${response.statusText}`);
                }
            }
            throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
        console.log('??? Raw response text:', responseText);
        
        if (!responseText || responseText.trim() === '') {
            throw new Error('Server returned empty response');
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('‚ù? JSON parse error:', parseError);
            console.log('‚ù? Raw response that failed to parse:', responseText);
            
            // Try to handle multiple JSON objects (concatenated responses)
            try {
                // Split by }{ and try to parse the last valid JSON
                const jsonParts = responseText.split('}{');
                if (jsonParts.length > 1) {
                    // Reconstruct the last JSON object
                    const lastJson = '{' + jsonParts[jsonParts.length - 1];
                    console.log('??ß Attempting to parse last JSON part:', lastJson);
                    result = JSON.parse(lastJson);
                    console.log('‚?? Successfully parsed last JSON part');
                } else {
                    throw parseError;
                }
            } catch (secondParseError) {
                console.error('‚ù? Failed to parse multiple JSON objects:', secondParseError);
                throw new Error('Server returned malformed JSON response');
            }
        }
        
        // Check for fuel validation error in response (even with 400 status)
        if (result && result.success === false && result.error && result.error.includes('fuel')) {
            throw new Error(result.error);
        }
        
        // Check for rate limit error from server
        if (response.status === 429 && result.error === 'Rate limit exceeded') {
            if (window.rateLimiter && result.rate_limit) {
                window.rateLimiter.showRateLimitError(result.rate_limit, 'video generation');
            } else {
                showTemporaryMessage(result.message || 'Rate limit exceeded. Please try again later.', 'error');
            }
            return;
        }
        
        console.log('Video Image Proxy Response:', result);
        
        if (result.success) {
            // Extract request ID from response
            let requestId = null;
            
            if (result.data && result.data.data && result.data.data.id_request) {
                requestId = result.data.data.id_request;
            } else if (result.data && result.data.id_request) {
                requestId = result.data.id_request;
            } else if (result.request_id) {
                requestId = result.request_id;
            }
            
            // Generate fallback if no request ID
            if (!requestId) {
                const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                requestId = `video_image_request_${timestamp}_${randomSuffix}`;
                console.log('‚ù? Generated fallback request ID:', requestId);
            }
            
            // Reset progress state and start polling
            resetVideoLoadingState();
            startVideoPolling(requestId);
            showVideoPreview();
            
            showTemporaryMessage('Video from image generation request submitted successfully!', 'success');
            
        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Invalid response: missing required data');
        }
        
    } catch (error) {
        // Handle submission error
        const generateFormContainer = document.getElementById('generate-form-container');
        const videoPreview = document.getElementById('video-preview');
        
        if (generateFormContainer) {
            generateFormContainer.classList.remove('hidden');
        }
        if (videoPreview) {
            videoPreview.classList.add('hidden');
        }
        
        let errorMessage = 'Failed to submit video from image request';
        
        // Check if this is a rate limit error first (highest priority)
        if (error.message.includes('Rate limit exceeded') || error.message.includes('rate limit')) {
            errorMessage = error.message; // Use the exact rate limit error message
        } else if (error.message.includes('fuel')) {
            errorMessage = error.message; // Use the exact fuel error message
        } else if (error.message.includes('JSON') || error.message.includes('parse')) {
            errorMessage = 'Server response error. The video generation service may be temporarily unavailable.';
        } else if (error.message.includes('empty response')) {
            errorMessage = 'Server returned empty response. Please try again in a moment.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Server error')) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
        } else {
            errorMessage = error.message;
        }
        
        showTemporaryMessage(errorMessage, 'error');
    } finally {
        showVideoLoading(false);
    }
}

// Show video generation rate limit status
async function showVideoGenerationRateLimit() {
    if (!window.rateLimiter) return;
    
    try {
        const status = await window.rateLimiter.checkStatus('video_generation');
        
        if (status.enabled) {
            // Create rate limit info element if it doesn't exist
            let rateLimitInfo = document.getElementById('rate-limit-info');
            if (!rateLimitInfo) {
                rateLimitInfo = document.createElement('div');
                rateLimitInfo.id = 'rate-limit-info';
                
                // Insert before the generate form
                const generateForm = document.getElementById('generate-form-container');
                if (generateForm) {
                    generateForm.parentNode.insertBefore(rateLimitInfo, generateForm);
                }
            }
            
            // Use the new rate limiter display method
            window.rateLimiter.updateRateLimitDisplay('video_generation', status);
        }
        
    } catch (error) {
        console.error('Failed to show rate limit status:', error);
    }
}

// Show image video generation rate limit status (different from regular video generation)
async function showImageVideoGenerationRateLimit() {
    if (!window.rateLimiter) return;
    
    try {
        const status = await window.rateLimiter.checkStatus('image_video_generation');
        
        if (status.enabled) {
            // Create rate limit info element if it doesn't exist
            let rateLimitInfo = document.getElementById('rate-limit-info');
            if (!rateLimitInfo) {
                rateLimitInfo = document.createElement('div');
                rateLimitInfo.id = 'rate-limit-info';
                
                // Insert before the generate form
                const generateForm = document.getElementById('generate-form-container');
                if (generateForm) {
                    generateForm.parentNode.insertBefore(rateLimitInfo, generateForm);
                }
            }
            
            // Use the new rate limiter display method
            window.rateLimiter.updateRateLimitDisplay('image_video_generation', status);
        }
        
    } catch (error) {
        console.error('Failed to show image video generation rate limit status:', error);
    }
}



// Start polling for image status
function startImagePolling(requestId) {
    const requestIdElement = document.getElementById('request-id');
    const copyRequestIdBtn = document.getElementById('copy-request-id');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (requestIdElement) {
        requestIdElement.textContent = requestId;
    }
    
    // Enable copy button functionality
    if (copyRequestIdBtn) {
        copyRequestIdBtn.addEventListener('click', function() {
            copyToClipboard(requestId, 'Request ID copied to clipboard!');
        });
    }
    
    // Start manual JavaScript progress bar (90 seconds for images)
    if (progressBar && progressText) {
        progressBar.classList.remove('progress-bar-animated', 'progress-bar-extended');
        progressText.classList.remove('progress-text-animated', 'progress-text-extended');
        
        progressBar.style.width = '5%';
        progressBar.style.transition = 'width 0.5s ease';
        
        let currentProgress = 5;
        const targetProgress = 95;
        const duration = 90000; // 90 seconds for images
        const updateInterval = 1000;
        const progressStep = (targetProgress - currentProgress) / (duration / updateInterval);
        
        const progressInterval = setInterval(() => {
            currentProgress += progressStep;
            
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
                clearInterval(progressInterval);
            }
            
            progressBar.style.width = currentProgress + '%';
        }, updateInterval);
        
        window.currentImageProgressInterval = progressInterval;
        
        // Progress messages for image generation
        const progressMessages = [
            'Initializing AI models...',
            'Processing your prompt...',
            'Generating image composition...',
            'Applying artistic style...',
            'Rendering details...',
            'Enhancing quality...',
            'Finalizing images...',
            'Almost ready...'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (progressText && messageIndex < progressMessages.length) {
                progressText.textContent = progressMessages[messageIndex];
                messageIndex++;
            }
        }, 11250); // Change message every 11.25 seconds (90s / 8 messages)
        
        setTimeout(() => {
            clearInterval(messageInterval);
        }, 90000);
    }
    
    // Disable generate form during processing
    disableGenerateImageForm(true);
    
    let pollCount = 0;
    const maxPolls = 60; // 10 minutes max (60 * 10 seconds)
    const extendedWaitThreshold = 18; // 3 minutes (18 * 10 seconds)
    let extendedWaitMessageShown = false;
    
    const pollInterval = setInterval(async () => {
        try {
            pollCount++;
            
            // Show extended wait message after 3 minutes
            if (pollCount >= extendedWaitThreshold && !extendedWaitMessageShown) {
                extendedWaitMessageShown = true;
                showExtendedImageWaitMessage();
            }
            
            const response = await fetch(`/api/image_status.php?id=${encodeURIComponent(requestId)}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                const status = result.data.status;
                
                if (status === 'completed') {
                    clearInterval(pollInterval);
                    
                    // Complete progress bar immediately
                    if (progressBar) {
                        if (window.currentImageProgressInterval) {
                            clearInterval(window.currentImageProgressInterval);
                        }
                        progressBar.style.width = '100%';
                        progressBar.classList.remove('progress-bar-animated');
                    }
                    if (progressText) {
                        progressText.textContent = 'Images ready!';
                        progressText.classList.remove('progress-text-animated');
                    }
                    
                    const images = result.data.result;
                    if (images && images.length > 0) {
                        showImageResult(images);
                    } else {
                        showImageError('Completed but no images found.');
                    }
                    
                    disableGenerateImageForm(false);
                    
                } else if (status === 'failed' || status === 'error') {
                    clearInterval(pollInterval);
                    showImageError(result.data.error || 'Generation failed.');
                    disableGenerateImageForm(false);
                    
                } else if (status === 'pending' || status === 'processing') {
                    console.log(`Polling... Status: ${status} (Attempt ${pollCount})`);
                }
                
            } else {
                console.warn(`Polling warning: ${result.error || 'Unknown error'}`);
            }
            
            // Stop polling after max attempts
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showImageError('Request timed out. Please check the status later using your Request ID.');
                disableGenerateImageForm(false);
            }
            
        } catch (error) {
            console.error('Image Polling Error:', error);
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showImageError('Polling failed due to network or server issues.');
                disableGenerateImageForm(false);
            }
        }
    }, 10000); // Poll every 10 seconds
}

// Show supporter only message
function showSupporterOnlyMessage(message) {
    // Create or update supporter message
    let supporterMsg = document.getElementById('supporter-message');
    if (!supporterMsg) {
        supporterMsg = document.createElement('div');
        supporterMsg.id = 'supporter-message';
        supporterMsg.className = 'fixed top-4 right-4 bg-purple-900 bg-opacity-90 border border-purple-400 text-purple-200 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        document.body.appendChild(supporterMsg);
    }
    
    supporterMsg.innerHTML = `
        <div class="flex items-start">
            <i data-lucide="crown" class="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0"></i>
            <div>
                <div class="font-semibold text-sm mb-1">Supporter Only Feature</div>
                <div class="text-xs">${message}</div>
                <div class="mt-2">
                    <a href="https://saweria.co/mralien" target="_blank" class="inline-flex items-center text-purple-300 hover:text-purple-200 text-xs">
                        <i data-lucide="external-link" class="w-3 h-3 mr-1"></i>
                        Become a Supporter
                    </a>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-purple-400 hover:text-purple-200">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (supporterMsg && supporterMsg.parentNode) {
            supporterMsg.remove();
        }
    }, 5000);
}

// Show duplicate fuel message
function showDuplicateFuelMessage(message) {
    // Create duplicate fuel message
    let duplicateMsg = document.getElementById('duplicate-fuel-message');
    if (duplicateMsg) {
        duplicateMsg.remove(); // Remove existing message
    }
    
    duplicateMsg = document.createElement('div');
    duplicateMsg.id = 'duplicate-fuel-message';
    duplicateMsg.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-900 bg-opacity-90 border border-yellow-400 text-yellow-200 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    document.body.appendChild(duplicateMsg);
    
    duplicateMsg.innerHTML = `
        <div class="flex items-start">
            <i data-lucide="alert-triangle" class="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0"></i>
            <div class="flex-1">
                <div class="font-semibold text-sm mb-2">Duplicate Fuel Detected</div>
                <div class="text-xs leading-relaxed mb-3">${message}</div>
                <div class="text-xs text-yellow-300">
                    ??° Tip: Each fuel URL can only be used once to prevent duplicate processing.
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-yellow-400 hover:text-yellow-200 flex-shrink-0">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
    `;
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-hide after 8 seconds (longer for duplicate message)
    setTimeout(() => {
        if (duplicateMsg && duplicateMsg.parentNode) {
            duplicateMsg.remove();
        }
    }, 8000);
}

// Get AI-generated video idea from webhook
async function getAIVideoIdea() {
    try {
        // Get CSRF token
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Security token unavailable');
        }

        const response = await fetch('https://auto.mralien-tools.com/webhook/give-idea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                csrf_token: csrfToken,
                timestamp: new Date().toISOString(),
                source: 'mralien-tools.com'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('AI Idea Response:', result);

        if (result.success && result.data && result.data.prompt) {
            // Use AI-generated prompt
            const aiPrompt = result.data.prompt.trim();
            console.log('AI Prompt to set:', aiPrompt);
            
            if (aiPrompt && aiPrompt.length > 0) {
                // Get video prompt element fresh
                const videoPromptElement = document.getElementById('video-prompt');
                console.log('Video prompt element found:', !!videoPromptElement);
                
                if (videoPromptElement) {
                    videoPromptElement.value = aiPrompt;
                    videoPromptElement.dispatchEvent(new Event('input')); // Trigger char counter
                    console.log('AI prompt set successfully');
                } else {
                    console.error('video-prompt element not found');
                }
                showTemporaryMessage('AI-generated idea loaded successfully!', 'success');
            } else {
                throw new Error('AI returned empty prompt');
            }
        } else {
            throw new Error('Invalid AI response format');
        }

    } catch (error) {
        console.error('AI Idea Error:', error);
        
        // Fallback to local ideas
        console.log('Falling back to local ideas...');
        const fallbackIdea = getVideoIdeas();
        
        // Get video prompt element fresh for fallback
        const videoPromptElement = document.getElementById('video-prompt');
        console.log('Fallback - Video prompt element found:', !!videoPromptElement);
        
        if (videoPromptElement) {
            videoPromptElement.value = fallbackIdea;
            videoPromptElement.dispatchEvent(new Event('input')); // Trigger char counter
            console.log('Fallback prompt set successfully');
        } else {
            console.error('video-prompt element not found in fallback');
        }
        showTemporaryMessage('Using local idea (AI service unavailable)', 'warning');
        
    } finally {
        const giveIdeaBtn = document.getElementById('give-idea-btn');
        if (giveIdeaBtn) {
            showActionLoading(giveIdeaBtn, false);
        }
    }
}

// Get AI-enhanced prompt from webhook
async function getAIEnhancedPrompt(originalPrompt) {
    try {
        // Get CSRF token
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Security token unavailable');
        }

        const response = await fetch('https://auto.mralien-tools.com/webhook/enhance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                prompt: originalPrompt,
                csrf_token: csrfToken,
                timestamp: new Date().toISOString(),
                source: 'mralien-tools.com'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('AI Enhance Response:', result);

        if (result.success && result.data && result.data.prompt) {
            // Use AI-enhanced prompt
            const enhancedPrompt = result.data.prompt.trim();
            console.log('AI Enhanced Prompt to set:', enhancedPrompt);
            
            if (enhancedPrompt && enhancedPrompt.length > 0) {
                // Get video prompt element fresh
                const videoPromptElement = document.getElementById('video-prompt');
                console.log('Video prompt element found for enhance:', !!videoPromptElement);
                
                if (videoPromptElement) {
                    videoPromptElement.value = enhancedPrompt;
                    videoPromptElement.dispatchEvent(new Event('input')); // Trigger char counter
                    console.log('AI enhanced prompt set successfully');
                } else {
                    console.error('video-prompt element not found for enhance');
                }
                showTemporaryMessage('Prompt enhanced by AI successfully!', 'success');
            } else {
                throw new Error('AI returned empty enhanced prompt');
            }
        } else {
            throw new Error('Invalid AI enhance response format');
        }

    } catch (error) {
        console.error('AI Enhance Error:', error);
        
        // Fallback to local enhancement
        console.log('Falling back to local enhancement...');
        const fallbackEnhanced = enhancePrompt(originalPrompt);
        
        // Get video prompt element fresh for fallback
        const videoPromptElement = document.getElementById('video-prompt');
        console.log('Fallback enhance - Video prompt element found:', !!videoPromptElement);
        
        if (videoPromptElement) {
            videoPromptElement.value = fallbackEnhanced;
            videoPromptElement.dispatchEvent(new Event('input')); // Trigger char counter
            console.log('Fallback enhanced prompt set successfully');
        }
    } finally {
        const enhancePromptBtn = document.getElementById('enhance-prompt-btn');
        if (enhancePromptBtn) {
            showActionLoading(enhancePromptBtn, false);
        }
    }
}

// Get AI-generated image idea from webhook
async function getAIImageIdea() {
    try {
        // Get CSRF token
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Security token unavailable');
        }

        const response = await fetch('https://auto.mralien-tools.com/webhook/give-idea-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                csrf_token: csrfToken,
                timestamp: new Date().toISOString(),
                source: 'mralien-tools.com'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('AI Image Idea Response:', result);

        if (result.success && result.data && result.data.prompt) {
            // Use AI-generated prompt
            const aiPrompt = result.data.prompt.trim();
            console.log('AI Image Prompt to set:', aiPrompt);
            
            if (aiPrompt && aiPrompt.length > 0) {
                // Get image prompt element fresh
                const imagePromptElement = document.getElementById('image-prompt');
                console.log('Image prompt element found:', !!imagePromptElement);
                
                if (imagePromptElement) {
                    imagePromptElement.value = aiPrompt;
                    imagePromptElement.dispatchEvent(new Event('input')); // Trigger char counter
                    console.log('AI image prompt set successfully');
                } else {
                    console.error('image-prompt element not found');
                }
                showTemporaryMessage('AI-generated image idea loaded successfully!', 'success');
            } else {
                throw new Error('AI returned empty prompt');
            }
        } else {
            throw new Error('Invalid AI response format');
        }

    } catch (error) {
        console.error('AI Image Idea Error:', error);
        
        // Fallback to local ideas
        console.log('Falling back to local image ideas...');
        const fallbackIdea = getRandomImageIdea();
        
        // Get image prompt element fresh for fallback
        const imagePromptElement = document.getElementById('image-prompt');
        console.log('Fallback - Image prompt element found:', !!imagePromptElement);
        
        if (imagePromptElement) {
            imagePromptElement.value = fallbackIdea;
            imagePromptElement.dispatchEvent(new Event('input')); // Trigger char counter
            console.log('Fallback image prompt set successfully');
        } else {
            console.error('image-prompt element not found in fallback');
        }
        showTemporaryMessage('Using local idea (AI service unavailable)', 'warning');
        
    } finally {
        const giveIdeaBtn = document.getElementById('give-idea-btn');
        if (giveIdeaBtn) {
            showActionLoading(giveIdeaBtn, false);
        }
    }
}

// Get AI-enhanced image prompt from webhook
async function getAIEnhancedImagePrompt(originalPrompt) {
    try {
        // Get CSRF token
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Security token unavailable');
        }

        const response = await fetch('https://auto.mralien-tools.com/webhook/enhance-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                prompt: originalPrompt,
                csrf_token: csrfToken,
                timestamp: new Date().toISOString(),
                source: 'mralien-tools.com'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('AI Image Enhance Response:', result);

        if (result.success && result.data && result.data.prompt) {
            // Use AI-enhanced prompt
            const enhancedPrompt = result.data.prompt.trim();
            console.log('AI Enhanced Image Prompt to set:', enhancedPrompt);
            
            if (enhancedPrompt && enhancedPrompt.length > 0) {
                // Get image prompt element fresh
                const imagePromptElement = document.getElementById('image-prompt');
                console.log('Image prompt element found for enhance:', !!imagePromptElement);
                
                if (imagePromptElement) {
                    imagePromptElement.value = enhancedPrompt;
                    imagePromptElement.dispatchEvent(new Event('input')); // Trigger char counter
                    console.log('AI enhanced image prompt set successfully');
                } else {
                    console.error('image-prompt element not found for enhance');
                }
                showTemporaryMessage('Image prompt enhanced by AI successfully!', 'success');
            } else {
                throw new Error('AI returned empty enhanced prompt');
            }
        } else {
            throw new Error('Invalid AI enhance response format');
        }

    } catch (error) {
        console.error('AI Image Enhance Error:', error);
        
        // Fallback to local enhancement
        console.log('Falling back to local image enhancement...');
        const fallbackEnhanced = enhanceImagePrompt(originalPrompt);
        
        // Get image prompt element fresh for fallback
        const imagePromptElement = document.getElementById('image-prompt');
        console.log('Fallback enhance - Image prompt element found:', !!imagePromptElement);
        
        if (imagePromptElement) {
            imagePromptElement.value = fallbackEnhanced;
            imagePromptElement.dispatchEvent(new Event('input')); // Trigger char counter
            console.log('Fallback enhanced image prompt set successfully');
        }
    } finally {
        const enhancePromptBtn = document.getElementById('enhance-prompt-btn');
        if (enhancePromptBtn) {
            showActionLoading(enhancePromptBtn, false);
        }
    }
}

// Helper functions for prompt generation
function getVideoIdeas() {
    const ideas = [
        "A cinematic shot of a lone astronaut walking on a red Martian landscape during sunset, with Earth visible in the distant sky. The camera slowly pans around the astronaut as they plant a flag.",
        "A magical forest scene where glowing butterflies dance around ancient trees. Sunbeams filter through the canopy creating ethereal light patterns on the moss-covered ground.",
        "A bustling cyberpunk city street at night with neon signs reflecting on wet pavement. Flying cars zoom overhead while people in futuristic clothing walk below.",
        "A peaceful Japanese garden with cherry blossoms falling gently into a koi pond. A traditional wooden bridge crosses the water as morning mist creates a dreamy atmosphere.",
        "An underwater scene showing a colorful coral reef teeming with tropical fish. The camera glides smoothly through the water as rays of sunlight penetrate from above.",
        "A cozy coffee shop on a rainy day with warm lighting. Steam rises from coffee cups while people read books and work on laptops. Rain droplets streak down the windows.",
        "A majestic dragon soaring through cloudy skies above medieval castle towers. The dragon's scales shimmer in the sunlight as it gracefully navigates between the clouds.",
        "A time-lapse of a flower blooming in a meadow, from seed to full blossom. Bees and butterflies visit the flower as the seasons change around it."
    ];
    return ideas[Math.floor(Math.random() * ideas.length)];
}

function getRandomVideoIdea() {
    const themes = ['nature', 'sci-fi', 'fantasy', 'urban', 'abstract', 'vintage'];
    const subjects = ['person walking', 'flying object', 'flowing water', 'growing plant', 'moving clouds', 'dancing lights'];
    const settings = ['forest', 'city', 'space', 'underwater', 'mountain', 'desert', 'beach', 'garden'];
    const moods = ['peaceful', 'dramatic', 'mysterious', 'energetic', 'dreamy', 'intense'];
    const times = ['sunrise', 'sunset', 'night', 'golden hour', 'stormy weather', 'clear day'];
    
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    
    return `A ${mood} ${theme} scene featuring ${subject} in a ${setting} during ${time}. The camera movement is smooth and cinematic, capturing the essence of the moment with beautiful lighting and composition.`;
}

function enhancePrompt(originalPrompt) {
    const enhancements = [
        "cinematic camera movement",
        "dramatic lighting",
        "high-quality 4K resolution",
        "smooth transitions",
        "professional color grading",
        "detailed textures",
        "atmospheric effects",
        "dynamic composition"
    ];
    
    const cameraMovements = [
        "with a slow zoom-in",
        "with a gentle pan across the scene",
        "with a smooth tracking shot",
        "with a dramatic reveal",
        "with a 360-degree rotation",
        "with a bird's eye view"
    ];
    
    const lightingEffects = [
        "golden hour lighting",
        "soft ambient lighting",
        "dramatic shadows",
        "volumetric lighting",
        "rim lighting",
        "natural sunlight"
    ];
    
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    const movement = cameraMovements[Math.floor(Math.random() * cameraMovements.length)];
    const lighting = lightingEffects[Math.floor(Math.random() * lightingEffects.length)];
    
    return `${originalPrompt} The scene is captured ${movement}, featuring ${lighting} and ${enhancement} for a professional, visually stunning result.`;
}

// Enhance image prompt locally
function enhanceImagePrompt(originalPrompt) {
    const enhancements = [
        "ultra-high resolution",
        "professional photography quality",
        "masterpiece artwork",
        "award-winning composition",
        "stunning visual details",
        "photorealistic rendering",
        "artistic excellence",
        "breathtaking imagery"
    ];
    
    const lightingEffects = [
        "perfect lighting",
        "dramatic chiaroscuro",
        "soft natural lighting",
        "golden hour illumination",
        "studio lighting setup",
        "atmospheric lighting"
    ];
    
    const qualityTerms = [
        "highly detailed",
        "sharp focus",
        "vibrant colors",
        "rich textures",
        "perfect composition",
        "professional grade"
    ];
    
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    const lighting = lightingEffects[Math.floor(Math.random() * lightingEffects.length)];
    const quality = qualityTerms[Math.floor(Math.random() * qualityTerms.length)];
    
    return `${originalPrompt}, ${enhancement}, ${lighting}, ${quality}, trending on artstation`;
}

// Show temporary message
function showTemporaryMessage(message, type = 'info') {
    const colors = {
        'info': 'bg-blue-900 border-blue-400 text-blue-200',
        'warning': 'bg-yellow-900 border-yellow-400 text-yellow-200',
        'success': 'bg-green-900 border-green-400 text-green-200',
        'error': 'bg-red-900 border-red-400 text-red-200'
    };
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} bg-opacity-90 border px-4 py-3 rounded-lg shadow-lg z-50 max-w-md text-center`;
    messageDiv.innerHTML = `
        <div class="flex items-center justify-center">
            <i data-lucide="info" class="w-4 h-4 mr-2"></i>
            <span class="text-sm">${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Show loading state for action buttons
function showActionLoading(button, isLoading) {
    if (!button) return;
    
    const icon = button.querySelector('i');
    const originalText = button.textContent.trim();
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-not-allowed');
        if (icon) {
            icon.setAttribute('data-lucide', 'loader-2');
            icon.classList.add('animate-spin');
        }
        // Store original text
        button.dataset.originalText = originalText;
        button.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 mr-1 animate-spin"></i>Loading...';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        button.disabled = false;
        button.classList.remove('opacity-75', 'cursor-not-allowed');
        // Restore original content
        const originalContent = button.dataset.originalText || originalText;
        button.innerHTML = originalContent;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Get CSRF token from server
async function getCSRFToken() {
    try {
        const response = await fetch('api/get_csrf_token.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.csrf_token) {
            return data.csrf_token;
        } else {
            throw new Error(data.error || 'Failed to get security token');
        }
        
    } catch (error) {
        console.error('CSRF Token Error:', error);
        showTemporaryMessage('Security token error. Please refresh the page.', 'error');
        return null;
    }
}

// Get CSRF token for specific form
async function getCSRFTokenForForm(formName) {
    try {
        const response = await fetch(`api/get_csrf_token.php?form=${encodeURIComponent(formName)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.csrf_token) {
            return data.csrf_token;
        } else {
            throw new Error(data.error || 'Failed to get security token');
        }
        
    } catch (error) {
        console.error('CSRF Token Error:', error);
        showTemporaryMessage('Security token error. Please refresh the page.', 'error');
        return null;
    }
}

// Submit image request to webhook
async function submitImageRequest(prompt, quantity, style, orientation) {
    console.log('??Ø submitImageRequest called with:', { prompt, quantity, style, orientation });
    
    try {
        // Check rate limit before proceeding
        if (window.rateLimiter) {
            try {
                console.log('??ç Checking rate limit for image generation...');
                const rateLimitCheck = await window.rateLimiter.isAllowed('image_generation');
                console.log('‚?? Rate limit check result:', rateLimitCheck);
                
                if (!rateLimitCheck.allowed) {
                    console.log('‚ù? Rate limit exceeded, blocking submission');
                    window.rateLimiter.showRateLimitError(rateLimitCheck, 'image generation');
                    return;
                }
                console.log('‚?? Rate limit check passed, proceeding with submission');
            } catch (rateLimitError) {
                console.warn('‚?†Ô∏è Rate limiter check failed, proceeding anyway:', rateLimitError);
            }
        } else {
            console.log('‚?†Ô∏è Rate limiter not available, proceeding without check');
        }

        // Get CSRF token for image generation
        console.log('??? Getting CSRF token for image generation...');
        const csrfToken = await getCSRFTokenForForm('image_generation');
        console.log('??? CSRF token received:', csrfToken ? 'YES' : 'NO');
        
        if (!csrfToken) {
            throw new Error('Security token unavailable. Please refresh the page.');
        }
        
        // Clean and validate prompt
        console.log('?ßπ Cleaning and preparing request data...');
        const cleanPrompt = prompt.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        const requestData = {
            prompt: cleanPrompt,
            quantity: parseInt(quantity),
            style: style || 'hyper-realistic',
            orientation: orientation || '1:1',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            source: 'mralien-tools.com',
            csrf_token: csrfToken
        };
        
        // Add user email if available for supporter access validation
        if (window.userSupporterAccess && window.userSupporterAccess.userEmail) {
            requestData.user_email = window.userSupporterAccess.userEmail;
        } else {
            const supporterEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
            if (supporterEmail) {
                requestData.user_email = supporterEmail;
            }
        }
        
        console.log('??¶ Request data prepared:', {
            prompt: cleanPrompt.substring(0, 50) + '...',
            quantity: requestData.quantity,
            style: requestData.style,
            orientation: requestData.orientation
        });
        
        const jsonString = JSON.stringify(requestData);
        console.log('‚?? JSON validation passed, data size:', jsonString.length, 'bytes');
        
        console.log('??? Sending request to image proxy with rate limiting...');
        
        const response = await fetch('api/image_proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: jsonString,
            timeout: 30000
        });
        
        console.log('??° Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('??? Raw response text:', responseText);
        
        if (!responseText || responseText.trim() === '') {
            throw new Error('Server returned empty response');
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('‚?? JSON parsed successfully:', result);
        } catch (parseError) {
            console.log('‚?†Ô∏è JSON parse failed, trying to extract last valid JSON...');
            const jsonObjects = responseText.trim().split('}{');
            if (jsonObjects.length > 1) {
                const lastJson = '{' + jsonObjects[jsonObjects.length - 1];
                try {
                    result = JSON.parse(lastJson);
                    console.log('‚?? Last JSON object parsed successfully:', result);
                } catch (secondParseError) {
                    throw new Error('Server returned malformed JSON response');
                }
            } else {
                throw new Error('Server returned malformed JSON response');
            }
        }
        
        // Check for rate limit error from server
        if (response.status === 429 && result.error === 'Rate limit exceeded') {
            if (window.rateLimiter && result.rate_limit) {
                window.rateLimiter.showRateLimitError(result.rate_limit, 'image generation');
            } else {
                showTemporaryMessage(result.message || 'Rate limit exceeded. Please try again later.', 'error');
            }
            return;
        }
        
        console.log('Image Request Response:', result);
        
        if (result.success) {
            // Extract request ID from response
            let requestId = null;
            
            if (result.data && result.data.data && result.data.data.id_request) {
                requestId = result.data.data.id_request;
            } else if (result.data && result.data.id_request) {
                requestId = result.data.id_request;
            } else if (result.request_id) {
                requestId = result.request_id;
            }
            
            // Generate fallback if no request ID
            if (!requestId) {
                const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                requestId = `image_request_${timestamp}_${randomSuffix}`;
                console.log('‚ù? Generated fallback request ID:', requestId);
            }
            
            // Reset progress state and start polling
            resetImageLoadingState();
            startImagePolling(requestId);
            showImagePreview();
            
            showTemporaryMessage('Image generation request submitted successfully!', 'success');
            
        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Invalid response: missing required data');
        }
        
    } catch (error) {
        // Handle submission error
        const generateFormContainer = document.getElementById('generate-form-container');
        const imagePreview = document.getElementById('image-preview');
        
        if (generateFormContainer) {
            generateFormContainer.classList.remove('hidden');
        }
        if (imagePreview) {
            imagePreview.classList.add('hidden');
        }
        
        let errorMessage = 'Failed to submit image request';
        if (error.message.includes('JSON') || error.message.includes('parse')) {
            errorMessage = 'Server response error. The image generation service may be temporarily unavailable.';
        } else if (error.message.includes('empty response')) {
            errorMessage = 'Server returned empty response. Please try again in a moment.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Server error')) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
        } else {
            errorMessage = error.message;
        }
        
        showTemporaryMessage(errorMessage, 'error');
    } finally {
        showImageLoading(false);
    }
}

// Submit video request to n8n webhook
async function submitVideoRequest(prompt, duration, style, type, orientation) {
    console.log('??Ø submitVideoRequest called with:', { prompt, duration, style, type, orientation });
    
    try {
        // Check rate limit before proceeding
        if (window.rateLimiter) {
            try {
                console.log('??ç Checking rate limit for video generation...');
                const rateLimitCheck = await window.rateLimiter.isAllowed('video_generation');
                console.log('‚?? Rate limit check result:', rateLimitCheck);
                
                if (!rateLimitCheck.allowed) {
                    console.log('‚ù? Rate limit exceeded, blocking submission');
                    window.rateLimiter.showRateLimitError(rateLimitCheck, 'video generation');
                    return;
                }
                console.log('‚?? Rate limit check passed, proceeding with submission');
            } catch (rateLimitError) {
                console.warn('‚?†Ô∏è Rate limiter check failed, proceeding anyway:', rateLimitError);
                // Continue with submission if rate limiter fails
            }
        } else {
            console.log('‚?†Ô∏è Rate limiter not available, proceeding without check');
        }

        // Validate inputs before sending
        console.log('??ç Validating inputs...');
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Video description is required');
        }
        
        if (!duration || isNaN(parseInt(duration))) {
            throw new Error('Invalid duration value');
        }
        
        console.log('‚?? Input validation passed');
        
        // Get CSRF token
        console.log('??? Getting CSRF token...');
        const csrfToken = await getCSRFToken();
        console.log('??? CSRF token received:', csrfToken ? 'YES' : 'NO');
        
        if (!csrfToken) {
            throw new Error('Security token unavailable. Please refresh the page.');
        }
        
        // Clean and validate prompt
        console.log('?ßπ Cleaning and preparing request data...');
        const cleanPrompt = prompt.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
        
        const requestData = {
            prompt: cleanPrompt,
            duration: parseInt(duration),
            style: style || 'realistic',
            type: type || 'visual-only',
            orientation: orientation || 'landscape',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            source: 'mralien-tools.com',
            csrf_token: csrfToken
        };
        
        // Always add user_email (null if not available) for supporter tracking
        let userEmail = null;
        if (window.userSupporterAccess && window.userSupporterAccess.userEmail) {
            userEmail = window.userSupporterAccess.userEmail;
        } else {
            // Check session storage for supporter email
            userEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
        }
        requestData.user_email = userEmail;
        console.log('??? user_email set to:', userEmail);
        
        // Add device fingerprint for enhanced rate limiting
        if (typeof DeviceFingerprinting !== 'undefined') {
            try {
                const fingerprint = await DeviceFingerprinting.collectFingerprint();
                requestData.device_fingerprint = fingerprint;
                console.log('??ç Device fingerprint added for enhanced rate limiting');
            } catch (error) {
                console.warn('Failed to collect device fingerprint:', error);
            }
        }
        
        console.log('??¶ Request data prepared:', {
            prompt: cleanPrompt.substring(0, 50) + '...',
            duration: requestData.duration,
            style: requestData.style,
            type: requestData.type,
            orientation: requestData.orientation
        });
        
        // Validate JSON before sending
        const jsonString = JSON.stringify(requestData);
        if (!jsonString || jsonString === '{}') {
            throw new Error('Failed to create valid JSON request');
        }
        
        console.log('‚?? JSON validation passed, data size:', jsonString.length, 'bytes');
        
        console.log('??? Sending request to api/video_proxy.php...');
        console.log('??° Request headers:', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'X-CSRF-Token': csrfToken ? 'SET' : 'NOT_SET',
        });
        
        const response = await fetch('api/video_proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'X-CSRF-Token': csrfToken,
            },
            credentials: 'same-origin',
            body: jsonString,
            timeout: 30000 // 30 second timeout
        });
        
        console.log('??° Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        // Get response text first to handle empty responses
        const responseText = await response.text();
        
        // Check if response is ok
        if (!response.ok) {
            // Handle 400 Bad Request specifically for fuel validation errors
            if (response.status === 400) {
                try {
                    const errorData = JSON.parse(responseText);
                    if (errorData.error && errorData.error.includes('fuel')) {
                        throw new Error(errorData.error);
                    }
                    // If not fuel error, throw the actual error from server
                    throw new Error(errorData.error || `Server error (${response.status}): ${response.statusText}`);
                } catch (parseError) {
                    // Check if parseError is actually our fuel error that we threw
                    if (parseError.message && parseError.message.includes('fuel')) {
                        throw parseError; // Re-throw the fuel error
                    }
                    // If JSON parsing fails, throw generic error
                    throw new Error(`Server error (${response.status}): ${response.statusText}`);
                }
            }
            throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
        console.log('??? Raw response text:', responseText);
        
        // Check if response is empty
        if (!responseText || responseText.trim() === '') {
            throw new Error('Server returned empty response');
        }
        
        // Handle multiple JSON objects in response (fix for concatenated responses)
        let result;
        try {
            // Try to parse as single JSON first
            result = JSON.parse(responseText);
            console.log('‚?? Single JSON parsed successfully:', result);
        } catch (parseError) {
            console.log('‚?†Ô∏è Single JSON parse failed, trying to extract last valid JSON...');
            
            // If single parse fails, try to extract the last valid JSON object
            const jsonObjects = responseText.trim().split('}{');
            if (jsonObjects.length > 1) {
                // Reconstruct the last JSON object
                const lastJson = '{' + jsonObjects[jsonObjects.length - 1];
                try {
                    result = JSON.parse(lastJson);
                    console.log('‚?? Last JSON object parsed successfully:', result);
                } catch (secondParseError) {
                    console.error('‚ù? Failed to parse last JSON object:', lastJson);
                    throw new Error('Server returned malformed JSON response');
                }
            } else {
                console.error('‚ù? Response is not valid JSON:', responseText);
                throw new Error('Server returned malformed JSON response');
            }
        }
        
        // Response parsed successfully
        
        // Check for fuel validation error in response (even with 400 status)
        if (result && result.success === false && result.error && result.error.includes('fuel')) {
            throw new Error(result.error);
        }
        
        // Check for rate limit error from server
        if (response.status === 429 && result.error === 'Rate limit exceeded') {
            if (window.rateLimiter && result.rate_limit) {
                window.rateLimiter.showRateLimitError(result.rate_limit, 'video generation');
            } else {
                showTemporaryMessage(result.message || 'Rate limit exceeded. Please try again later.', 'error');
            }
            return;
        }
        
        // Validate response structure
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid response structure');
        }
        
        // Debug: Log the actual response structure
        console.log('Video Proxy Response:', result);
        console.log('Response type:', typeof result);
        console.log('Result.success:', result.success);
        console.log('Result.data:', result.data);
        console.log('Result.data type:', typeof result.data);
        
        if (result.success) {
            // Extract request ID from response
            let requestId = null;
            
            // Debug: Check what's actually in result.data
            if (result.data) {
                console.log('result.data.id_request:', result.data.id_request);
                console.log('result.data.id_request type:', typeof result.data.id_request);
            }
            
            // Primary: Check result.data.data.id_request (n8n response wrapped by proxy)
            if (result.data && result.data.data && result.data.data.id_request) {
                requestId = result.data.data.id_request;
                console.log('‚?? Using server request ID from wrapped response:', requestId);
            }
            // Secondary: Check result.data.id_request (direct n8n response)
            else if (result.data && result.data.id_request) {
                requestId = result.data.id_request;
                console.log('‚?? Using server request ID from direct response:', requestId);
            } 
            // Fallback: Check other possible locations
            else if (result.request_id) {
                requestId = result.request_id;
                console.log('‚?†Ô∏è Using fallback request ID from result.request_id:', requestId);
            } 
            else if (result.data && result.data.request_id) {
                requestId = result.data.request_id;
                console.log('‚?†Ô∏è Using fallback request ID from result.data.request_id:', requestId);
            }
            
            // If still no request ID, generate fallback
            if (!requestId) {
                const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                requestId = `video_request_${timestamp}_${randomSuffix}`;
                console.log('‚ù? Generated fallback request ID:', requestId);
                console.log('‚ù? This means server response did not contain expected request ID');
            }
            
            // Reset progress state BEFORE starting new animation
            resetVideoLoadingState();
            
            // Start polling and show preview with the request ID
            startVideoPolling(requestId);
            showVideoPreview();
            
            // Show success message
            showTemporaryMessage('Video generation request submitted successfully!', 'success');
            
        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Invalid response: missing required data');
        }
        
    } catch (error) {
        // Handle submission error
        
        // Show form again on error (without clearing input values)
        const generateFormContainer = document.getElementById('generate-form-container');
        const videoPreview = document.getElementById('video-preview');
        
        if (generateFormContainer) {
            generateFormContainer.classList.remove('hidden');
        }
        if (videoPreview) {
            videoPreview.classList.add('hidden');
        }
        
        // Show specific error messages
        let errorMessage = 'Failed to submit video request';
        
        // Check if this is a rate limit error first (highest priority)
        if (error.message.includes('Rate limit exceeded') || error.message.includes('rate limit')) {
            errorMessage = error.message; // Use the exact rate limit error message
        } else if (error.message.includes('fuel')) {
            errorMessage = error.message; // Use the exact fuel error message
        } else if (error.message.includes('JSON') || error.message.includes('parse')) {
            errorMessage = 'Server response error. The video generation service may be temporarily unavailable.';
        } else if (error.message.includes('empty response')) {
            errorMessage = 'Server returned empty response. Please try again in a moment.';
        } else if (error.message.includes('malformed')) {
            errorMessage = 'Server response is corrupted. Please try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Server error')) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
        } else {
            errorMessage = error.message;
        }
        
        showTemporaryMessage(errorMessage, 'error');
    } finally {
        showVideoLoading(false);
    }
}

// Show video loading state
function showVideoLoading(isLoading) {
    const generateBtn = document.getElementById('generate-video-btn');
    const generateFormContainer = document.getElementById('generate-form-container');
    
    if (generateBtn) {
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
            generateBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>Generating...';
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            generateBtn.innerHTML = '<i data-lucide="video" class="w-4 h-4 mr-2"></i>Generate Video';
        }
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Reset video loading state to initial condition
function resetVideoLoadingState() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const loadingMessage = document.getElementById('loading-message');
    
    // Clear any running manual progress interval
    if (window.currentProgressInterval) {
        clearInterval(window.currentProgressInterval);
        window.currentProgressInterval = null;
    }
    
    // Reset progress bar
    if (progressBar) {
        progressBar.classList.remove('progress-bar-animated', 'progress-bar-extended');
        
        // Remove any inline styles that might interfere
        progressBar.style.removeProperty('width');
        progressBar.style.removeProperty('animation');
        progressBar.style.removeProperty('transition');
        progressBar.style.removeProperty('background');
        
        // Force reflow to ensure removal takes effect
        progressBar.offsetHeight;
        
        // Reset to base classes and initial width
        progressBar.className = 'bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full';
        progressBar.style.width = '10%';
    }
    
    // Reset progress text
    if (progressText) {
        progressText.classList.remove('progress-text-animated', 'progress-text-extended', 'text-yellow-300');
        progressText.textContent = 'Initializing...';
        progressText.className = 'text-xs text-gray-500';
    }
    
    // Reset loading message
    if (loadingMessage) {
        loadingMessage.textContent = 'Processing your request...';
        loadingMessage.className = 'text-gray-400 mb-4';
    }
}

// Show video preview section
function showVideoPreview() {
    const videoPreview = document.getElementById('video-preview');
    const videoLoading = document.getElementById('video-loading');
    const videoResult = document.getElementById('video-result');
    const videoError = document.getElementById('video-error');
    const generateFormContainer = document.getElementById('generate-form-container');
    
    // DON'T reset progress bar state here - it will clear the running animation!
    // resetVideoLoadingState();
    
    // Hide generate form immediately
    if (generateFormContainer) {
        generateFormContainer.classList.add('hidden');
    }
    
    if (videoPreview) {
        videoPreview.classList.remove('hidden');
        videoLoading.classList.remove('hidden');
        videoResult.classList.add('hidden');
        videoError.classList.add('hidden');
        videoPreview.scrollIntoView({ behavior: 'smooth' });
    }
}

// Start polling for video status
function startVideoPolling(requestId) {
    const requestIdElement = document.getElementById('request-id');
    const copyRequestIdBtn = document.getElementById('copy-request-id');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (requestIdElement) {
        requestIdElement.textContent = requestId;
    }
    
    // Enable copy button functionality
    if (copyRequestIdBtn) {
        copyRequestIdBtn.addEventListener('click', function() {
            copyToClipboard(requestId, 'Request ID copied to clipboard!');
        });
    }
    
    // Start manual JavaScript progress bar (2 minutes = 120 seconds)
    if (progressBar && progressText) {
        // Remove any CSS animations - we'll do it manually
        progressBar.classList.remove('progress-bar-animated', 'progress-bar-extended');
        progressText.classList.remove('progress-text-animated', 'progress-text-extended');
        
        // Set initial state
        progressBar.style.width = '5%';
        progressBar.style.transition = 'width 0.5s ease';
        
        // Manual progress animation
        let currentProgress = 5;
        const targetProgress = 95;
        const duration = 120000; // 2 minutes in milliseconds
        const updateInterval = 1000; // Update every 1 second
        const progressStep = (targetProgress - currentProgress) / (duration / updateInterval);
        
        const progressInterval = setInterval(() => {
            currentProgress += progressStep;
            
            // Cap at 95%
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
                clearInterval(progressInterval);
            }
            
            // Update progress bar
            progressBar.style.width = currentProgress + '%';
            
        }, updateInterval);
        
        // Store interval ID for cleanup
        window.currentProgressInterval = progressInterval;
        
        // Progress messages that change during animation
        const progressMessages = [
            'Initializing AI models...',
            'Processing your prompt...',
            'Generating video frames...',
            'Applying visual style...',
            'Rendering scenes...',
            'Adding effects...',
            'Optimizing quality...',
            'Finalizing video...',
            'Almost ready...',
            'Completing generation...'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (progressText && messageIndex < progressMessages.length) {
                progressText.textContent = progressMessages[messageIndex];
                messageIndex++;
            }
        }, 12000); // Change message every 12 seconds (120s / 10 messages)
        
        // Clear message interval when done
        setTimeout(() => {
            clearInterval(messageInterval);
        }, 120000); // 2 minutes
    }
    
    // Disable generate form during processing
    disableGenerateForm(true);
    
    let pollCount = 0;
    const maxPolls = 120; // 20 minutes max (120 * 10 seconds)
    const extendedWaitThreshold = 30; // 5 minutes (30 * 10 seconds)
    let extendedWaitMessageShown = false;
    
    const pollInterval = setInterval(async () => {
        try {
            pollCount++;
            
            // Show extended wait message after 5 minutes
            if (pollCount >= extendedWaitThreshold && !extendedWaitMessageShown) {
                extendedWaitMessageShown = true;
                showExtendedWaitMessage();
            }
            
            const response = await fetch(`/api/video_status.php?id=${encodeURIComponent(requestId)}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                const status = result.data.status;
                
                if (status === 'completed') {
                    clearInterval(pollInterval);
                    
                    // Complete progress bar immediately
                    if (progressBar) {
                        // Clear manual progress interval
                        if (window.currentProgressInterval) {
                            clearInterval(window.currentProgressInterval);
                        }
                        progressBar.style.width = '100%';
                        progressBar.classList.remove('progress-bar-animated');
                    }
                    if (progressText) {
                        progressText.textContent = 'Video ready!';
                        progressText.classList.remove('progress-text-animated');
                    }
                    
                    const filename = result.data.result;
                    if (filename) {
                        showVideoResult(filename);
                    } else {
                        showVideoError('Completed but no video file found.');
                    }
                    
                    // Re-enable form
                    disableGenerateForm(false);
                    
                } else if (status === 'failed' || status === 'error') {
                    clearInterval(pollInterval);
                    showVideoError(result.data.error || 'Generation failed.');
                    
                    // Re-enable form
                    disableGenerateForm(false);
                    
                } else if (status === 'pending' || status === 'processing') {
                    // Continue polling
                    console.log(`Polling... Status: ${status} (Attempt ${pollCount})`);
                }
                
            } else {
                // Handle non-200 response or {success: false}
                console.warn(`Polling warning: ${result.error || 'Unknown error'}`);
            }
            
            // Stop polling after max attempts
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showVideoError('Request timed out. Please check the status later using your Request ID.');
                
                // Re-enable form
                disableGenerateForm(false);
            }
            
        } catch (error) {
            console.error('Polling Error:', error);
            // Don't stop polling on intermittent network errors, but stop on others
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showVideoError('Polling failed due to network or server issues.');
                
                // Re-enable form
                disableGenerateForm(false);
            }
        }
    }, 10000); // Poll every 10 seconds
}

// Show extended wait message
function showExtendedWaitMessage() {
    const loadingMessage = document.getElementById('loading-message');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    
    if (loadingMessage) {
        loadingMessage.textContent = 'This is taking longer than usual...';
        loadingMessage.className = 'text-yellow-300 mb-4';
    }
    
    if (progressText) {
        progressText.textContent = 'AI is working hard, please be patient...';
        progressText.className = 'text-xs text-yellow-400';
        progressText.classList.add('progress-text-extended');
    }
    
    if (progressBar) {
        progressBar.classList.remove('progress-bar-animated');
        progressBar.classList.add('progress-bar-extended');
    }
}

// Show video result
function showVideoResult(filename) {
    const videoLoading = document.getElementById('video-loading');
    const videoResult = document.getElementById('video-result');
    const videoSource = document.getElementById('video-source');
    const downloadLink = document.getElementById('download-video');
    const shareBtn = document.getElementById('share-video');
    const generateNewBtn = document.getElementById('generate-new-video');
    
    if (videoLoading) videoLoading.classList.add('hidden');
    if (videoResult) videoResult.classList.remove('hidden');
    
    const videoUrl = `generated_videos/${filename}`;
    
    if (videoSource) {
        videoSource.src = videoUrl;
        videoSource.parentElement.load(); // Load the new video
    }
    
    if (downloadLink) {
        downloadLink.href = videoUrl;
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareUrl = `${window.location.origin}${window.location.pathname}?app=short-video-gen&request_id=${document.getElementById('request-id').textContent}`;
            copyToClipboard(shareUrl, 'Share link copied to clipboard!');
        });
    }
    
    if (generateNewBtn) {
        generateNewBtn.addEventListener('click', () => {
            resetToGenerateForm();
        });
    }
}

// Show video error
function showVideoError(message) {
    const videoLoading = document.getElementById('video-loading');
    const videoError = document.getElementById('video-error');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-generation');
    
    if (videoLoading) videoLoading.classList.add('hidden');
    if (videoError) videoError.classList.remove('hidden');
    
    if (errorMessage) {
        errorMessage.textContent = message || 'An unknown error occurred.';
    }
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            resetToGenerateForm();
        });
    }
}

// Reset to the initial form state
function resetToGenerateForm() {
    const videoPreview = document.getElementById('video-preview');
    const generateFormContainer = document.getElementById('generate-form-container');
    const videoPrompt = document.getElementById('video-prompt');
    
    if (videoPreview) videoPreview.classList.add('hidden');
    if (generateFormContainer) generateFormContainer.classList.remove('hidden');
    
    // Optional: Clear the prompt for a fresh start
    if (videoPrompt) {
        videoPrompt.value = '';
        videoPrompt.dispatchEvent(new Event('input'));
    }
    
    // Re-enable form fields
    disableGenerateForm(false);
}

// Show extended wait message for images
function showExtendedImageWaitMessage() {
    const loadingMessage = document.getElementById('loading-message');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    
    if (loadingMessage) {
        loadingMessage.textContent = 'This is taking longer than usual...';
        loadingMessage.className = 'text-yellow-300 mb-4';
    }
    
    if (progressText) {
        progressText.textContent = 'AI is working hard, please be patient...';
        progressText.className = 'text-xs text-yellow-400';
        progressText.classList.add('progress-text-extended');
    }
    
    if (progressBar) {
        progressBar.classList.remove('progress-bar-animated');
        progressBar.classList.add('progress-bar-extended');
    }
}

// Show image result
function showImageResult(images) {
    const imageLoading = document.getElementById('image-loading');
    const imageResult = document.getElementById('image-result');
    const imageGallery = document.getElementById('image-gallery');
    const downloadAllBtn = document.getElementById('download-all-images');
    const shareBtn = document.getElementById('share-images');
    const generateNewBtn = document.getElementById('generate-new-images');
    
    if (imageLoading) imageLoading.classList.add('hidden');
    if (imageResult) imageResult.classList.remove('hidden');
    
    // Populate image gallery
    if (imageGallery && images.length > 0) {
        imageGallery.innerHTML = images.map((image, index) => `
            <div class="relative group">
                <img src="generated_images/${image}" alt="Generated Image ${index + 1}" 
                     class="w-full h-auto rounded-lg border border-gray-600 hover:border-blue-400 transition-colors cursor-pointer"
                     onclick="openImageModal('generated_images/${image}')">
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href="generated_images/${image}" download 
                       class="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                        <i data-lucide="download" class="w-3 h-3 mr-1"></i>
                        Download
                    </a>
                </div>
            </div>
        `).join('');
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', () => {
            images.forEach((image, index) => {
                const link = document.createElement('a');
                link.href = `generated_images/${image}`;
                link.download = `generated_image_${index + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareUrl = `${window.location.origin}${window.location.pathname}?app=image-gen&request_id=${document.getElementById('request-id').textContent}`;
            copyToClipboard(shareUrl, 'Share link copied to clipboard!');
        });
    }
    
    if (generateNewBtn) {
        generateNewBtn.addEventListener('click', () => {
            resetToGenerateImageForm();
        });
    }
}

// Show image error
function showImageError(message) {
    const imageLoading = document.getElementById('image-loading');
    const imageError = document.getElementById('image-error');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-generation');
    
    if (imageLoading) imageLoading.classList.add('hidden');
    if (imageError) imageError.classList.remove('hidden');
    
    if (errorMessage) {
        errorMessage.textContent = message || 'An unknown error occurred.';
    }
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            resetToGenerateImageForm();
        });
    }
}

// Reset to the initial image form state
function resetToGenerateImageForm() {
    const imagePreview = document.getElementById('image-preview');
    const generateFormContainer = document.getElementById('generate-form-container');
    const imagePrompt = document.getElementById('image-prompt');
    
    if (imagePreview) imagePreview.classList.add('hidden');
    if (generateFormContainer) generateFormContainer.classList.remove('hidden');
    
    // Optional: Clear the prompt for a fresh start
    if (imagePrompt) {
        imagePrompt.value = '';
        imagePrompt.dispatchEvent(new Event('input'));
    }
    
    // Re-enable form fields
    disableGenerateImageForm(false);
}

// Disable/enable generate image form
function disableGenerateImageForm(disabled) {
    const formElements = [
        document.getElementById('image-prompt'),
        document.getElementById('image-quantity'),
        document.getElementById('image-style'),
        document.getElementById('image-orientation'),
        document.getElementById('generate-image-btn'),
        document.getElementById('give-idea-btn'),
        document.getElementById('enhance-prompt-btn'),
        document.getElementById('random-prompt-btn'),
        document.getElementById('clear-prompt-btn')
    ];
    
    formElements.forEach(el => {
        if (el) {
            el.disabled = disabled;
            if (disabled) {
                el.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                el.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    });
}

// Open image modal for full view
function openImageModal(imageSrc) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full p-4">
                <img id="modal-image" src="" alt="Full size image" class="max-w-full max-h-full object-contain rounded-lg">
                <button id="close-image-modal" class="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('#close-image-modal');
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Set image source and show modal
    const modalImage = modal.querySelector('#modal-image');
    modalImage.src = imageSrc;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Disable/enable generate form
function disableGenerateForm(disabled) {
    const formElements = [
        document.getElementById('video-prompt'),
        document.getElementById('video-type'),
        document.getElementById('video-duration'),
        document.getElementById('video-style'),
        document.getElementById('video-orientation'),
        document.getElementById('generate-video-btn'),
        document.getElementById('give-idea-btn'),
        document.getElementById('enhance-prompt-btn'),
        document.getElementById('random-prompt-btn'),
        document.getElementById('clear-prompt-btn')
    ];
    
    formElements.forEach(el => {
        if (el) {
            el.disabled = disabled;
            if (disabled) {
                el.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                el.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    });
}

// Clipboard helper
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showTemporaryMessage(successMessage, 'success');
    }).catch(err => {
        console.error('Clipboard copy failed:', err);
        showTemporaryMessage('Failed to copy to clipboard', 'error');
    });
}

// Initialize Status Check functionality
function initializeStatusCheck() {
    const accordionToggle = document.getElementById('accordion-toggle');
    const accordionContent = document.getElementById('accordion-content');
    const accordionIcon = document.getElementById('accordion-icon');
    const checkRequestIdInput = document.getElementById('check-request-id');
    const pasteRequestIdBtn = document.getElementById('paste-request-id');
    const checkStatusBtn = document.getElementById('check-status-btn');
    const statusCheckResult = document.getElementById('status-check-result');
    
    // Accordion toggle
    if (accordionToggle) {
        accordionToggle.addEventListener('click', () => {
            const isHidden = accordionContent.classList.contains('hidden');
            accordionContent.classList.toggle('hidden');
            accordionIcon.classList.toggle('rotate-180', isHidden);
        });
    }
    
    // Paste from clipboard
    if (pasteRequestIdBtn) {
        pasteRequestIdBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (checkRequestIdInput) {
                    checkRequestIdInput.value = text;
                    showTemporaryMessage('Request ID pasted from clipboard', 'success');
                }
            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
                showTemporaryMessage('Failed to paste from clipboard', 'error');
            }
        });
    }
    
    // Check status button
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', async () => {
            const requestId = checkRequestIdInput.value.trim();
            if (!requestId) {
                showTemporaryMessage('Please enter a Request ID', 'warning');
                return;
            }
            
            // Show loading in button
            checkStatusBtn.disabled = true;
            checkStatusBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i>Checking...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            try {
                const response = await fetch(`/api/video_status.php?id=${encodeURIComponent(requestId)}`);
                const result = await response.json();
                
                if (response.ok && result.success) {
                    displayStatusResult(result.data, requestId);
                } else {
                    displayStatusResult({ status: 'error', error: result.error || 'Could not find this Request ID.' }, requestId);
                }
                
            } catch (error) {
                console.error('Status Check Error:', error);
                displayStatusResult({ status: 'error', error: 'Failed to connect to the server.' }, requestId);
            } finally {
                // Restore button
                checkStatusBtn.disabled = false;
                checkStatusBtn.innerHTML = '<i data-lucide="search" class="w-5 h-5 mr-2"></i>Check Status';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
}

// Display status check result
function displayStatusResult(data, requestId) {
    const statusCheckResult = document.getElementById('status-check-result');
    const statusContent = document.getElementById('status-content');
    
    if (!statusCheckResult || !statusContent) return;
    
    let contentHtml = '';
    const status = data.status.toLowerCase();
    
    const statusClasses = {
        'completed': 'text-green-400 border-green-500',
        'processing': 'text-blue-400 border-blue-500',
        'pending': 'text-yellow-400 border-yellow-500',
        'failed': 'text-red-400 border-red-500',
        'error': 'text-red-400 border-red-500'
    };
    
    const statusIcons = {
        'completed': 'check-circle',
        'processing': 'loader-2 animate-spin',
        'pending': 'clock',
        'failed': 'alert-circle',
        'error': 'x-circle'
    };
    
    contentHtml += `
        <div class="flex items-center justify-between mb-4">
            <div class="font-mono text-sm text-gray-300 break-all">ID: ${requestId || data.id_request || 'N/A'}</div>
            <div class="flex items-center text-sm font-semibold px-3 py-1 rounded-full border ${statusClasses[status] || 'text-gray-400 border-gray-500'}">
                <i data-lucide="${statusIcons[status] || 'help-circle'}" class="w-4 h-4 mr-2"></i>
                <span>${data.status || 'Unknown'}</span>
            </div>
        </div>
    `;
    
    if (status === 'completed') {
        const videoUrl = `generated_videos/${data.result}`;
        contentHtml += `
            <p class="text-sm text-gray-300 mb-4">Your video is ready!</p>
            <div class="video-container bg-black rounded-lg overflow-hidden mb-4">
                <video controls class="w-full h-auto max-h-80" preload="metadata">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="flex gap-2">
                <a href="${videoUrl}" download class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                    Download
                </a>
                <button onclick="copyToClipboard('${window.location.origin}${window.location.pathname}?app=short-video-gen&request_id=${requestId}', 'Share link copied!')" class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <i data-lucide="share-2" class="w-4 h-4 mr-2"></i>
                    Share
                </button>
            </div>
        `;
    } else if (status === 'processing' || status === 'pending') {
        contentHtml += `
            <p class="text-sm text-gray-300">Your video is currently being processed. Please check back in a few moments.</p>
            <p class="text-xs text-gray-500 mt-2">Last updated: ${new Date(data.updated_at).toLocaleString()}</p>
        `;
    } else { // Failed or Error
        contentHtml += `
            <p class="text-sm text-red-300">There was an error with your request.</p>
            <p class="text-xs text-gray-400 bg-gray-800 p-2 rounded-md mt-2 font-mono">${data.error || 'No specific error message available.'}</p>
        `;
    }
    
    statusContent.innerHTML = contentHtml;
    statusCheckResult.classList.remove('hidden');
    statusCheckResult.scrollIntoView({ behavior: 'smooth' });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Initialize Refuel Modal
function initializeRefuelModal() {
    const refuelBtn = document.getElementById('refuel-btn');
    const refuelModal = document.getElementById('refuel-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const refuelForm = document.getElementById('refuel-form');
    const fuelInput = document.getElementById('fuel-input');

    if (refuelBtn) {
        refuelBtn.addEventListener('click', () => {
            if (refuelModal) refuelModal.classList.remove('hidden');
        });
    }

    const closeModal = () => {
        if (refuelModal) refuelModal.classList.add('hidden');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (refuelForm) {
        refuelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fuelParam = fuelInput.value.trim();
            if (!fuelParam) {
                showTemporaryMessage('Please enter a fuel parameter', 'warning');
                return;
            }

            const submitBtn = refuelForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>Submitting...';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            try {
                const csrfToken = await getCSRFToken();
                if (!csrfToken) throw new Error('Security token error');

                const response = await fetch('api/refuel_v2.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                    },
                    body: JSON.stringify({ url: fuelParam, csrf_token: csrfToken })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showTemporaryMessage(result.message || 'Refuel successful!', 'success');
                    // Clear the form input
                    fuelInput.value = '';
                    closeModal();
                    // Optionally, refresh fuel stats after a short delay
                    setTimeout(fetchLiveStats, 1000);
                } else {
                    // Handle different error types based on HTTP status and error code
                    if (response.status === 409 || result.error_code === 'DUPLICATE_FUEL') {
                        // Show specific message for duplicate fuel
                        showDuplicateFuelMessage(result.message || result.error);
                    } else {
                        showTemporaryMessage(result.error || 'Refuel failed', 'error');
                    }
                }

            } catch (error) {
                console.error('Refuel Error:', error);
                showTemporaryMessage('Network error occurred during refuel. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4 mr-2"></i>Submit';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
}

// Fetch and display live stats (including Fuel)
async function fetchLiveStats() {
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
        
        const response = await fetch(`api/analytics.php?${queryParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success && result.stats) {
            const stats = result.stats;
            
            // Animate visitor counters
            animateCounter('total-visitors', stats.total_visitors || 0);
            animateCounter('active-users', stats.active_users || 0);
            animateCounter('last-24h', stats.visitors_last_24h || 0);
            
            // Animate fuel counters
            animateCounter('fuel-active', stats.fuel_active || 0);
            animateCounter('fuel-total', stats.fuel_total || 0);
            animateCounter('fuel-expired', stats.fuel_expired || 0);
            animateCounter('fuel-active-premium', stats.fuel_active_premium || 0);
            
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
            
            // Update fuel quota breakdown in tooltip
            const quotaVisual = document.getElementById('tooltip-quota-visual');
            const quotaVisualAudio = document.getElementById('tooltip-quota-visual-audio');
            if (quotaVisual) {
                quotaVisual.textContent = (stats.quota_visual || 0).toLocaleString();
            }
            if (quotaVisualAudio) {
                quotaVisualAudio.textContent = (stats.quota_visual_audio || 0).toLocaleString();
            }

            // Update AI requests
            const aiRequestsTotal = document.getElementById('ai-requests-total');
            if (aiRequestsTotal) {
                aiRequestsTotal.textContent = (stats.ai_requests_total || 0).toLocaleString();
            }
            const tooltipPending = document.getElementById('tooltip-pending');
            if (tooltipPending) {
                tooltipPending.textContent = (stats.ai_requests_pending || 0).toLocaleString();
            }
            const tooltipCompleted = document.getElementById('tooltip-completed');
            if (tooltipCompleted) {
                tooltipCompleted.textContent = (stats.ai_requests_completed || 0).toLocaleString();
            }

            // Update fuel alert
            const fuelAlert = document.getElementById('fuel-alert');
            if (fuelAlert) {
                const alertIcon = fuelAlert.querySelector('i');
                const alertText = fuelAlert.querySelector('span');

                if (alertIcon && alertText) {
                    if (stats.fuel_active === 0) {
                        fuelAlert.className = 'glass-effect rounded-lg p-3 border-l-4 border-red-400 bg-red-900 bg-opacity-20';
                        alertIcon.setAttribute('data-lucide', 'alert-triangle');
                        alertText.className = 'text-red-300 text-xs';
                        alertText.textContent = 'All workers are down! AI tools are offline.';
                    } else if (stats.fuel_soon_expired > 0) {
                        fuelAlert.className = 'glass-effect rounded-lg p-3 border-l-4 border-yellow-400 bg-yellow-900 bg-opacity-20';
                        alertIcon.setAttribute('data-lucide', 'alert-triangle');
                        alertText.className = 'text-yellow-300 text-xs';
                        alertText.textContent = 'Some workers will be exhausted soon.';
                    } else {
                        fuelAlert.className = 'glass-effect rounded-lg p-3 border-l-4 border-green-400 bg-green-900 bg-opacity-20';
                        alertIcon.setAttribute('data-lucide', 'check-circle');
                        alertText.className = 'text-green-300 text-xs';
                        alertText.textContent = 'Tools are running smoothly!';
                    }
                    
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching live stats:', error);
    }
}

// Animate counter utility (updated to handle undefined values)
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element || targetValue === undefined || targetValue === null) return;
    
    // Ensure targetValue is a number
    const target = parseInt(targetValue) || 0;
    const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    
    if (startValue === target) {
        element.textContent = target.toLocaleString();
        return;
    }
    
    const duration = 1500;
    const startTime = performance.now();
    
    const step = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = Math.floor(progress * (target - startValue) + startValue);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    requestAnimationFrame(step);
}

// Add custom scrollbar styles for recent requests
const scrollbarStyles = document.createElement('style');
scrollbarStyles.textContent = `
    /* Custom scrollbar for recent requests */
    .recent-requests-scroll {
        scrollbar-width: thin;
        scrollbar-color: #4b5563 #1f2937;
    }
    
    .recent-requests-scroll::-webkit-scrollbar {
        width: 6px;
    }
    
    .recent-requests-scroll::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 3px;
    }
    
    .recent-requests-scroll::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 3px;
        transition: background 0.2s ease;
    }
    
    .recent-requests-scroll::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }
    
    .recent-requests-scroll::-webkit-scrollbar-thumb:active {
        background: #9ca3af;
    }
    
    /* Line clamp utility for mobile */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
        max-height: calc(1.4em * 2);
    }
`;
document.head.appendChild(scrollbarStyles);

// Recent Short Video Requests functionality
function loadRecentRequests() {
    console.log('??? Loading recent requests...');
    
    const loadingEl = document.getElementById('recent-requests-loading');
    const listEl = document.getElementById('recent-requests-list');
    const emptyEl = document.getElementById('recent-requests-empty');
    const errorEl = document.getElementById('recent-requests-error');
    
    console.log('??ç Elements found:', {
        loading: !!loadingEl,
        list: !!listEl,
        empty: !!emptyEl,
        error: !!errorEl
    });
    
    if (!loadingEl) {
        console.log('‚ù? Recent requests elements not found - not on short video page');
        return;
    }
    
    // Show loading state
    loadingEl.classList.remove('hidden');
    if (listEl) listEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    
    console.log('??ê Fetching from: api/get_recent_short_video_requests.php');
    
    fetch('api/get_recent_short_video_requests.php')
        .then(response => {
            console.log('??° Response received:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text(); // Get as text first to debug
        })
        .then(text => {
            console.log('??? Raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('‚?? Parsed JSON:', data);
                
                loadingEl.classList.add('hidden');
                
                if (data.success && data.data && data.data.length > 0) {
                    console.log(`??? Displaying ${data.data.length} requests`);
                    displayRecentRequests(data.data);
                    if (listEl) listEl.classList.remove('hidden');
                } else {
                    console.log('??≠ No data found, showing empty state');
                    if (emptyEl) emptyEl.classList.remove('hidden');
                }
            } catch (parseError) {
                console.error('‚ù? JSON parse error:', parseError);
                console.error('Raw text that failed to parse:', text);
                loadingEl.classList.add('hidden');
                if (errorEl) errorEl.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('‚ù? Fetch error:', error);
            loadingEl.classList.add('hidden');
            if (errorEl) errorEl.classList.remove('hidden');
        });
}

function displayRecentRequests(requests) {
    const listEl = document.getElementById('recent-requests-list');
    if (!listEl) return;
    
    listEl.innerHTML = requests.map(request => `
        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            <!-- Mobile Layout -->
            <div class="block sm:hidden">
                <div class="mb-2">
                    <p class="text-white text-sm font-medium line-clamp-2 mb-1" title="${request.description}">
                        ${request.description_short}
                    </p>
                    <div class="flex items-center justify-between mb-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${request.status_color}">
                            ${request.status_display}
                        </span>
                        <span class="text-xs text-gray-500">
                            ${request.created_at_formatted}
                        </span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-2 text-xs text-gray-400">
                    <span class="flex items-center">
                        <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                        ${request.duration_target}s
                    </span>
                    <span class="flex items-center">
                        <i data-lucide="video" class="w-3 h-3 mr-1"></i>
                        ${request.type_display}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-mono truncate mr-2">
                        ID: ${request.id.substring(0, 8)}...
                    </span>
                    <button class="text-blue-400 hover:text-blue-300 text-xs flex items-center flex-shrink-0" 
                            onclick="copyRequestId('${request.id}')" title="Copy full ID">
                        <i data-lucide="copy" class="w-3 h-3 mr-1"></i>
                        Copy
                    </button>
                </div>
            </div>
            
            <!-- Desktop Layout -->
            <div class="hidden sm:block">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1 min-w-0">
                        <p class="text-white text-sm font-medium truncate" title="${request.description}">
                            ${request.description_short}
                        </p>
                        <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${request.duration_target}s
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="palette" class="w-3 h-3 mr-1"></i>
                                ${request.style_display}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="video" class="w-3 h-3 mr-1"></i>
                                ${request.type_display}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1 ml-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${request.status_color}">
                            ${request.status_display}
                        </span>
                        <span class="text-xs text-gray-500">
                            ${request.created_at_formatted}
                        </span>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-mono">
                        ID: ${request.id.substring(0, 8)}...
                    </span>
                    <button class="text-blue-400 hover:text-blue-300 text-xs flex items-center" 
                            onclick="copyRequestId('${request.id}')" title="Copy full ID">
                        <i data-lucide="copy" class="w-3 h-3 mr-1"></i>
                        Copy ID
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-initialize Lucide icons for the new content
    lucide.createIcons();
}

function copyRequestId(requestId) {
    navigator.clipboard.writeText(requestId).then(() => {
        // Show a brief success message
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i data-lucide="check" class="w-3 h-3 mr-1"></i>Copied!';
        button.classList.add('text-green-400');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('text-green-400');
            button.classList.add('text-blue-400');
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy request ID:', err);
    });
}

// Initial data fetch and periodic refresh
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveStats();
    
    // Refresh stats every 30 seconds
    setInterval(fetchLiveStats, 30000);
    
    // Load recent requests only if we're on the short video generator page
    const currentApp = new URLSearchParams(window.location.search).get('app');
    if (document.getElementById('recent-requests-loading') && currentApp === 'short-video-gen') {
        console.log('??Ø Short video page detected, loading recent video requests...');
        loadRecentRequests();
        
        // Add event listeners for refresh and retry buttons
        const refreshBtn = document.getElementById('refresh-recent-requests');
        const retryBtn = document.getElementById('retry-recent-requests');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadRecentRequests);
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', loadRecentRequests);
        }
    }
});

// ===== SUPPORTER SYSTEM =====

// Global supporter access state
window.userSupporterAccess = {
    accessLevel: 'guest',
    hasAccess: false,
    expiresAt: null,
    canAccessFeature: function(feature) {
        if (!this.hasAccess || this.accessLevel === 'guest') {
            return false;
        }
        
        // Define feature requirements
        const featureRequirements = {
            'long_duration': ['supporter', 'premium'], // 40s duration
            'premium_duration': ['premium'], // 64s duration
            'premium_styles': ['premium'],
            'priority_queue': ['supporter', 'premium'],
            'unlimited_requests': ['premium']
        };
        
        if (!featureRequirements[feature]) {
            return true; // Feature doesn't require special access
        }
        
        return featureRequirements[feature].includes(this.accessLevel);
    }
};

// Initialize Supporter System
function initializeSupporterSystem() {
    console.log('??ê Initializing supporter system...');
    
    // Initialize supporter modal
    initializeSupporterModal();
    
    // Check current access status
    checkSupporterAccess();
    
    // Update UI based on access level
    updateSupporterUI();
}

// Initialize Supporter Modal
function initializeSupporterModal() {
    const supporterBtn = document.getElementById('supporter-access-btn');
    const supporterModal = document.getElementById('saweria-supporter-modal');
    const closeSupporterModal = document.getElementById('close-saweria-supporter-modal');
    const emailForm = document.getElementById('saweria-email-form');
    const codeBtn = document.getElementById('activate-saweria-code-btn');
    
    if (supporterBtn) {
        supporterBtn.addEventListener('click', () => {
            if (supporterModal) {
                supporterModal.classList.remove('hidden');
                // Refresh status when modal opens
                checkSupporterAccess();
            }
        });
    }
    
    if (closeSupporterModal) {
        closeSupporterModal.addEventListener('click', () => {
            if (supporterModal) {
                supporterModal.classList.add('hidden');
            }
        });
    }
    
    // Close modal when clicking outside
    if (supporterModal) {
        supporterModal.addEventListener('click', (e) => {
            if (e.target === supporterModal) {
                supporterModal.classList.add('hidden');
            }
        });
    }
    
    // Handle email form submission
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('saweria-email-input');
            const activateBtn = document.getElementById('activate-saweria-email-btn');
            const email = emailInput.value.trim();
            
            if (!email) {
                showTemporaryMessage('Please enter your email address', 'warning');
                return;
            }
            
            if (!email.includes('@')) {
                showTemporaryMessage('Please enter a valid email address', 'warning');
                return;
            }
            
            // Show loading state
            activateBtn.disabled = true;
            activateBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>Checking...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            try {
                const response = await fetch('api/saweria_supporter_manager.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'activate_email',
                        email: email
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showTemporaryMessage(result.message || 'Supporter access activated!', 'success');
                    
                    // Update global state
                    window.userSupporterAccess.hasAccess = true;
                    window.userSupporterAccess.accessLevel = result.access_level;
                    window.userSupporterAccess.expiresAt = result.expires_at;
                    window.userSupporterAccess.userEmail = email;
                    
                    // Store email and access level in session storage for future requests
                    sessionStorage.setItem('supporter_email', email);
                    sessionStorage.setItem('supporter_access_level', result.access_level);
                    localStorage.setItem('supporter_email', email);
                    localStorage.setItem('supporter_access_level', result.access_level);
                    
                    // Trigger event for duration options update
                    window.dispatchEvent(new CustomEvent('supporterAccessUpdated'));
                    
                    // Update UI
                    updateSupporterUI();
                    updateSaweriaModalStatus();
                    
                    // Clear form
                    emailInput.value = '';
                    
                    // Close modal after a delay
                    setTimeout(() => {
                        if (supporterModal) {
                            supporterModal.classList.add('hidden');
                        }
                    }, 3000);
                    
                } else {
                    showTemporaryMessage(result.error || 'Failed to activate access', 'error');
                }
                
            } catch (error) {
                console.error('Saweria activation error:', error);
                showTemporaryMessage('Network error. Please try again.', 'error');
            } finally {
                // Restore button
                activateBtn.disabled = false;
                activateBtn.innerHTML = '<i data-lucide="unlock" class="w-4 h-4 mr-2"></i>Activate Access';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
    
    // Handle code activation (fallback)
    if (codeBtn) {
        codeBtn.addEventListener('click', async () => {
            const codeInput = document.getElementById('saweria-code-input');
            const code = codeInput.value.trim().toUpperCase();
            
            if (!code) {
                showTemporaryMessage('Please enter an access code', 'warning');
                return;
            }
            
            // Show loading state
            codeBtn.disabled = true;
            codeBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>Activating...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            try {
                const response = await fetch('api/supporter_manager.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'activate_code',
                        code: code
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showTemporaryMessage(result.message || 'Access code activated!', 'success');
                    
                    // Update global state
                    window.userSupporterAccess.hasAccess = true;
                    window.userSupporterAccess.accessLevel = result.access_level;
                    window.userSupporterAccess.expiresAt = result.expires_at;
                    
                    // Store access level in session/localStorage for persistence
                    sessionStorage.setItem('supporter_access_level', result.access_level);
                    localStorage.setItem('supporter_access_level', result.access_level);
                    
                    // Update UI
                    updateSupporterUI();
                    updateSaweriaModalStatus();
                    
                    // Clear form
                    codeInput.value = '';
                    
                    // Close modal after a delay
                    setTimeout(() => {
                        if (supporterModal) {
                            supporterModal.classList.add('hidden');
                        }
                    }, 2000);
                    
                } else {
                    showTemporaryMessage(result.error || 'Failed to activate code', 'error');
                }
                
            } catch (error) {
                console.error('Code activation error:', error);
                showTemporaryMessage('Network error. Please try again.', 'error');
            } finally {
                // Restore button
                codeBtn.disabled = false;
                codeBtn.innerHTML = '<i data-lucide="key" class="w-4 h-4 mr-2"></i>Activate Code';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
}

// Check current supporter access status
async function checkSupporterAccess() {
    try {
        // Check if we have stored email and set it first
        const storedEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
        if (storedEmail && !window.userSupporterAccess.userEmail) {
            window.userSupporterAccess.userEmail = storedEmail;
            
            // Send email to backend to set session
            await fetch('api/saweria_supporter_manager.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'set_email',
                    email: storedEmail
                })
            });
        }
        
        const response = await fetch('api/saweria_supporter_manager.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            window.userSupporterAccess.hasAccess = result.data.has_access;
            window.userSupporterAccess.accessLevel = result.data.access_level;
            window.userSupporterAccess.expiresAt = result.data.expires_at;
            
            // Store access level in session/localStorage for persistence
            if (result.data.access_level) {
                sessionStorage.setItem('supporter_access_level', result.data.access_level);
                localStorage.setItem('supporter_access_level', result.data.access_level);
            }
            
            console.log('‚?? Supporter access checked:', window.userSupporterAccess);
            
            // Trigger event for duration options update
            window.dispatchEvent(new CustomEvent('supporterAccessUpdated'));
            
            // Update UI
            updateSupporterUI();
            updateSaweriaModalStatus();
            
            // Update duration options for video generator
            updateDurationOptionsForVideoType();
            
            // Refresh rate limiter display if on image video page
            if (window.rateLimiter && document.getElementById('generate-video-btn')) {
                const generateBtn = document.getElementById('generate-video-btn');
                const action = generateBtn.getAttribute('data-rate-limit-action');
                if (action === 'image_video_generation') {
                    setTimeout(() => {
                        showImageVideoGenerationRateLimit();
                    }, 500);
                } else if (action === 'video_generation') {
                    setTimeout(() => {
                        showVideoGenerationRateLimit();
                    }, 500);
                }
            }
        }
        
    } catch (error) {
        console.error('Error checking supporter access:', error);
    }
}

// Update supporter UI elements
function updateSupporterUI() {
    const supporterBtnText = document.getElementById('supporter-btn-text');
    const videoDuration = document.getElementById('video-duration');
    const myHistoryLink = document.getElementById('my-history-link');
    const myHistorySeparator = document.getElementById('my-history-separator');
    
    // Update supporter button text
    if (supporterBtnText) {
        if (window.userSupporterAccess.hasAccess && window.userSupporterAccess.accessLevel !== 'guest') {
            const levelText = window.userSupporterAccess.accessLevel === 'premium' ? 'Premium' : 'Supporter';
            supporterBtnText.textContent = `${levelText} Active`;
        } else {
            supporterBtnText.textContent = 'Supporter Access';
        }
    }
    
    // Show/hide My History menu based on supporter status
    if (myHistoryLink && myHistorySeparator) {
        let hasAccess = false;
        
        // Check multiple sources for access
        if (window.userSupporterAccess && window.userSupporterAccess.hasAccess && window.userSupporterAccess.accessLevel !== 'guest') {
            hasAccess = true;
        } else {
            // Check session/localStorage as fallback
            const storedLevel = sessionStorage.getItem('supporter_access_level') || localStorage.getItem('supporter_access_level');
            const storedEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
            if (storedLevel && storedLevel !== 'guest' && storedEmail) {
                hasAccess = true;
            }
        }
        
        if (hasAccess) {
            myHistoryLink.style.display = 'flex';
            myHistorySeparator.style.display = 'inline';
        } else {
            myHistoryLink.style.display = 'none';
            myHistorySeparator.style.display = 'none';
        }
    }
    
    // Update video duration options
    if (videoDuration) {
        const options = videoDuration.querySelectorAll('option');
        const accessLevel = window.userSupporterAccess.accessLevel;
        const hasAccess = window.userSupporterAccess.hasAccess;
        
        options.forEach(option => {
            const value = option.value;
            if (value === '40') {
                // 40s requires supporter or premium
                if (hasAccess && (accessLevel === 'supporter' || accessLevel === 'premium')) {
                    option.disabled = false;
                    option.classList.remove('text-gray-500');
                    option.textContent = option.textContent.replace(' (Supporter Only)', '').replace(' (Premium Only)', '');
                    if (!option.textContent.includes('40 seconds')) {
                        option.textContent = '40 seconds';
                    }
                } else {
                    option.disabled = true;
                    option.classList.add('text-gray-500');
                    if (!option.textContent.includes('(Supporter Only)')) {
                        option.textContent = option.textContent.replace(' (Premium Only)', '') + ' (Supporter Only)';
                    }
                }
            } else if (value === '64') {
                // 64s requires premium only
                if (hasAccess && accessLevel === 'premium') {
                    option.disabled = false;
                    option.classList.remove('text-gray-500');
                    option.textContent = option.textContent.replace(' (Supporter Only)', '').replace(' (Premium Only)', '');
                    if (!option.textContent.includes('64 seconds')) {
                        option.textContent = '64 seconds';
                    }
                } else {
                    option.disabled = true;
                    option.classList.add('text-gray-500');
                    if (!option.textContent.includes('(Premium Only)')) {
                        option.textContent = option.textContent.replace(' (Supporter Only)', '') + ' (Premium Only)';
                    }
                }
            }
        });
    }
}

// Update Saweria modal status display
function updateSaweriaModalStatus() {
    const currentAccessLevel = document.getElementById('saweria-current-access-level');
    const accessDetails = document.getElementById('saweria-access-details');
    const emailActivationForm = document.getElementById('saweria-email-activation-form');
    
    if (!currentAccessLevel || !accessDetails) return;
    
    const access = window.userSupporterAccess;
    
    if (access.hasAccess && access.accessLevel !== 'guest') {
        // User has supporter access
        const levelText = access.accessLevel === 'premium' ? 'Premium' : 'Supporter';
        const levelColor = access.accessLevel === 'premium' ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100';
        
        currentAccessLevel.className = `px-2 py-1 rounded-full text-xs font-medium ${levelColor}`;
        currentAccessLevel.textContent = levelText;
        
        if (access.expiresAt) {
            const expiryDate = new Date(access.expiresAt);
            accessDetails.textContent = `Access expires on ${expiryDate.toLocaleDateString()}`;
        } else {
            accessDetails.textContent = 'Permanent access';
        }
        
        // Hide email activation form for existing supporters
        if (emailActivationForm) {
            emailActivationForm.style.display = 'none';
        }
        
    } else {
        // User is guest
        currentAccessLevel.className = 'px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300';
        currentAccessLevel.textContent = 'Guest';
        accessDetails.textContent = 'You have basic access to the platform';
        
        // Show email activation form
        if (emailActivationForm) {
            emailActivationForm.style.display = 'block';
        }
    }
}

// Log supporter feature usage
async function logSupporterUsage(feature, value = null) {
    try {
        await fetch('api/saweria_supporter_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'log_usage',
                feature: feature,
                value: value
            })
        });
    } catch (error) {
        console.error('Error logging supporter usage:', error);
    }
}

// Current active tab
let currentSupporterTab = 'top';

// Top Supporters functionality
function loadTopSupporters() {
    const loadingEl = document.getElementById('supporters-loading');
    const emptyEl = document.getElementById('supporters-empty');
    const listEl = document.getElementById('supporters-list');
    const errorEl = document.getElementById('supporters-error');
    const countEl = document.getElementById('supporter-count');
    const containerEl = document.getElementById('supporters-container');
    
    // Show loading state
    loadingEl?.classList.remove('hidden');
    emptyEl?.classList.add('hidden');
    listEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');
    
    fetch('/api/get_top_supporters.php')
        .then(response => response.json())
        .then(data => {
            loadingEl?.classList.add('hidden');
            
            if (data.success && data.data.supporters.length > 0) {
                // Show supporters list
                listEl?.classList.remove('hidden');
                
                // Update count
                if (countEl) countEl.textContent = `${data.data.supporters.length} top`;
                
                // Populate supporters with compact layout
                if (containerEl) {
                    containerEl.innerHTML = data.data.supporters.map((supporter, index) => {
                        const rankIcon = index === 0 ? '?•?' : index === 1 ? '?•?' : index === 2 ? '?•?' : `${index + 1}.`;
                        const isTopThree = index < 3;
                        
                        const rankClass = index === 0 ? 'supporter-rank-gold' : 
                                         index === 1 ? 'supporter-rank-silver' : 
                                         index === 2 ? 'supporter-rank-bronze' : 'text-gray-400';
                        
                        return `
                            <div class="supporter-compact">
                                <div class="supporter-header">
                                    <div class="flex items-center flex-1 min-w-0">
                                        <div class="supporter-rank-compact ${rankClass}">
                                            ${rankIcon}
                                        </div>
                                        <div class="supporter-name" title="${supporter.name}">
                                            ${supporter.name}
                                        </div>
                                    </div>
                                    <div class="supporter-amount-compact ${isTopThree ? 'text-yellow-300' : 'text-green-400'}">
                                        IDR ${supporter.amount_formatted}
                                    </div>
                                </div>
                                <div class="supporter-meta">
                                    <div class="supporter-date">
                                        ${supporter.date_formatted}
                                    </div>
                                </div>
                                ${supporter.message ? `
                                    <div class="supporter-message-compact" title="${supporter.message}">
                                        "${supporter.message.length > 60 ? supporter.message.substring(0, 60) + '...' : supporter.message}"
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
                }
            } else {
                // Show empty state
                emptyEl?.classList.remove('hidden');
                if (countEl) countEl.textContent = 'No supporters yet';
            }
        })
        .catch(error => {
            console.error('Error loading top supporters:', error);
            loadingEl?.classList.add('hidden');
            errorEl?.classList.remove('hidden');
            if (countEl) countEl.textContent = 'Error loading';
        });
}

// Recent Supporters functionality
function loadRecentSupporters() {
    const loadingEl = document.getElementById('supporters-loading');
    const emptyEl = document.getElementById('supporters-empty');
    const listEl = document.getElementById('supporters-list');
    const errorEl = document.getElementById('supporters-error');
    const countEl = document.getElementById('supporter-count');
    const containerEl = document.getElementById('supporters-container');
    
    // Show loading state
    loadingEl?.classList.remove('hidden');
    emptyEl?.classList.add('hidden');
    listEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');
    
    fetch('/api/get_recent_supporters.php')
        .then(response => response.json())
        .then(data => {
            loadingEl?.classList.add('hidden');
            
            if (data.success && data.data.supporters.length > 0) {
                // Show supporters list
                listEl?.classList.remove('hidden');
                
                // Update count
                if (countEl) countEl.textContent = `${data.data.supporters.length} recent`;
                
                // Populate supporters with compact layout
                if (containerEl) {
                    containerEl.innerHTML = data.data.supporters.map((supporter, index) => {
                        const isRecent = index < 3; // First 3 are most recent
                        
                        return `
                            <div class="supporter-compact">
                                <div class="supporter-header">
                                    <div class="flex items-center flex-1 min-w-0">
                                        ${isRecent ? '<div class="recent-indicator"></div>' : '<div style="width: 18px;"></div>'}
                                        <div class="supporter-name" title="${supporter.name}">
                                            ${supporter.name}
                                        </div>
                                    </div>
                                    <div class="supporter-amount-compact text-green-400">
                                        IDR ${supporter.amount_formatted}
                                    </div>
                                </div>
                                <div class="supporter-meta">
                                    <div class="supporter-date">
                                        ${supporter.date_formatted} ${supporter.time_formatted}
                                    </div>
                                </div>
                                ${supporter.message ? `
                                    <div class="supporter-message-compact" title="${supporter.message}">
                                        "${supporter.message.length > 60 ? supporter.message.substring(0, 60) + '...' : supporter.message}"
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
                }
            } else {
                // Show empty state
                emptyEl?.classList.remove('hidden');
                if (countEl) countEl.textContent = 'No supporters yet';
            }
        })
        .catch(error => {
            console.error('Error loading recent supporters:', error);
            loadingEl?.classList.add('hidden');
            errorEl?.classList.remove('hidden');
            if (countEl) countEl.textContent = 'Error loading';
        });
}

// Switch between tabs
function switchSupporterTab(tab) {
    currentSupporterTab = tab;
    
    // Update tab appearance
    const topTab = document.getElementById('tab-top');
    const recentTab = document.getElementById('tab-recent');
    
    if (tab === 'top') {
        topTab?.classList.add('active');
        recentTab?.classList.remove('active');
        loadTopSupporters();
    } else {
        recentTab?.classList.add('active');
        topTab?.classList.remove('active');
        loadRecentSupporters();
    }
}

// Retry loading supporters
function retryLoadSupporters() {
    loadTopSupporters();
}

// Load supporters when page loads
// My Video History functionality
function initializeMyVideoHistory() {
    let currentPage = 1;
    let currentLimit = 12;
    let userEmail = null;
    
    // Get DOM elements
    const loadingState = document.getElementById('my-loading-state');
    const errorState = document.getElementById('my-error-state');
    const contentContainer = document.getElementById('my-content-container');
    const requestsGrid = document.getElementById('my-requests-grid');
    const paginationContainer = document.getElementById('my-pagination-container');
    const retryBtn = document.getElementById('my-retry-load');
    const detailModal = document.getElementById('my-request-detail-modal');
    const closeDetailModal = document.getElementById('close-my-detail-modal');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userAccessLevel = document.getElementById('user-access-level');
    
    // Get user email from supporter system
    if (window.userSupporterAccess && window.userSupporterAccess.userEmail) {
        userEmail = window.userSupporterAccess.userEmail;
    } else {
        userEmail = sessionStorage.getItem('supporter_email') || localStorage.getItem('supporter_email');
    }
    
    // Update user info display
    if (userEmailDisplay && userEmail) {
        userEmailDisplay.textContent = userEmail;
    }
    
    if (userAccessLevel) {
        let level = 'guest';
        let levelClass = 'px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300';
        
        // Check multiple sources for access level
        if (window.userSupporterAccess && window.userSupporterAccess.hasAccess && window.userSupporterAccess.accessLevel !== 'guest') {
            level = window.userSupporterAccess.accessLevel;
        } else {
            // Check session/localStorage as fallback
            const storedLevel = sessionStorage.getItem('supporter_access_level') || localStorage.getItem('supporter_access_level');
            if (storedLevel && storedLevel !== 'guest') {
                level = storedLevel;
            }
        }
        
        // Set display text and class based on level
        if (level === 'premium') {
            levelClass = 'px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-purple-100';
        } else if (level === 'supporter') {
            levelClass = 'px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-blue-100';
        }
        
        userAccessLevel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        userAccessLevel.className = levelClass;
    }
    
    // Event listeners
    if (retryBtn) {
        retryBtn.addEventListener('click', () => loadMyRequests());
    }
    
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', () => {
            closeMyModal();
        });
    }
    
    // Close modal when clicking outside
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal || e.target.closest('.absolute') === null) {
                closeMyModal();
            }
        });
    }
    
    // Close modal function
    function closeMyModal() {
        detailModal.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        
        if (window.modalScrollPosition !== undefined) {
            window.scrollTo(0, window.modalScrollPosition);
            delete window.modalScrollPosition;
        }
    }
    
    // Load requests function
    async function loadMyRequests() {
        // Check if user has access (multiple sources)
        let hasAccess = false;
        
        if (window.userSupporterAccess && window.userSupporterAccess.hasAccess && window.userSupporterAccess.accessLevel !== 'guest') {
            hasAccess = true;
        } else {
            // Check session/localStorage as fallback
            const storedLevel = sessionStorage.getItem('supporter_access_level') || localStorage.getItem('supporter_access_level');
            if (storedLevel && storedLevel !== 'guest' && userEmail) {
                hasAccess = true;
            }
        }
        
        if (!userEmail || !hasAccess) {
            showMyError('Please login as supporter/premium user to view your history.');
            return;
        }
        
        showMyLoading();
        
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: currentLimit,
                user_email: userEmail
            });
            
            const response = await fetch(`api/get_my_video_requests.php?${params}`);
            const result = await response.json();
            
            if (result.success) {
                displayMyRequests(result.data);
                displayMyPagination(result.pagination);
                showMyContent();
            } else {
                showMyError(result.error || 'Failed to load your video requests');
            }
        } catch (error) {
            console.error('Error loading my requests:', error);
            showMyError('Network error occurred while loading your requests');
        }
    }
    
    // Display functions
    function showMyLoading() {
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        contentContainer.classList.add('hidden');
    }
    
    function showMyError(message) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        contentContainer.classList.add('hidden');
        
        const errorMessage = document.getElementById('my-error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
    
    function showMyContent() {
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    }
    
    function displayMyRequests(requests) {
        if (!requestsGrid) return;
        
        if (requests.length === 0) {
            requestsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="glass-effect rounded-lg p-8 border border-gray-600">
                        <i data-lucide="video-off" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                        <p class="text-gray-400 mb-2">No video requests found</p>
                        <p class="text-gray-500 text-sm">Start creating videos to see your history here!</p>
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        
        requestsGrid.innerHTML = requests.map(request => createMyRequestCard(request)).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Add click listeners to cards
        requests.forEach(request => {
            const card = document.getElementById(`my-request-${request.id}`);
            if (card) {
                card.addEventListener('click', () => showMyRequestDetail(request));
            }
        });
    }
    
    function createMyRequestCard(request) {
        return `
            <div id="my-request-${request.id}" class="glass-effect rounded-lg p-4 border border-gray-600 hover:border-purple-400 transition-colors cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded text-xs font-medium ${request.status_color}">
                            ${request.status_display}
                        </span>
                        <span class="px-2 py-1 rounded text-xs bg-purple-400 bg-opacity-20 text-purple-300">
                            ${request.type_display}
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="text-sm text-gray-300 line-clamp-3">${request.description_short}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                    <div class="flex items-center">
                        <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                        ${request.duration_target}s
                    </div>
                    <div class="flex items-center">
                        <i data-lucide="palette" class="w-3 h-3 mr-1"></i>
                        ${request.style_display || 'From Image'}
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Created: ${request.created_at_formatted}</span>
                    ${request.has_result ? '<span class="text-green-400">‚?? Has Result</span>' : ''}
                </div>
                
                <div class="text-xs text-gray-400 font-mono">
                    #${request.id.substring(0, 6)}...
                </div>
            </div>
        `;
    }
    
    function displayMyPagination(pagination) {
        if (!paginationContainer || !pagination) return;
        
        const { current_page, total_pages, has_prev, has_next } = pagination;
        
        if (total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="flex items-center space-x-2">';
        
        // Previous button
        if (has_prev) {
            paginationHTML += `
                <button onclick="changeMyPage(${current_page - 1})" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === current_page;
            paginationHTML += `
                <button onclick="changeMyPage(${i})" class="px-3 py-1 ${isActive ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded transition-colors">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (has_next) {
            paginationHTML += `
                <button onclick="changeMyPage(${current_page + 1})" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    function showMyRequestDetail(request) {
        const modalContent = document.getElementById('my-modal-content');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="space-y-6">
                <!-- Request Info -->
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-purple-300 mb-2">Request Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-gray-400">ID:</span> <span class="text-white">#${request.id}</span></div>
                            <div><span class="text-gray-400">Status:</span> <span class="px-2 py-1 rounded text-xs ${request.status_color}">${request.status_display}</span></div>
                            <div><span class="text-gray-400">Type:</span> <span class="text-purple-300">${request.type_display}</span></div>
                            <div><span class="text-gray-400">Duration:</span> <span class="text-white">${request.duration_target} seconds</span></div>
                            <div><span class="text-gray-400">Style:</span> <span class="text-white">${request.style_display}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-purple-300 mb-2">Timestamps</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-gray-400">Created:</span> <span class="text-white">${request.created_at_formatted}</span></div>
                            <div><span class="text-gray-400">Updated:</span> <span class="text-white">${request.updated_at_formatted}</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Full Description -->
                <div>
                    <h4 class="font-semibold text-purple-300 mb-2">Full Description</h4>
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                        <p class="text-gray-300 whitespace-pre-wrap">${request.description}</p>
                    </div>
                </div>
                
                <!-- Result -->
                ${request.has_result ? `
                    <div>
                        <h4 class="font-semibold text-purple-300 mb-2">Result</h4>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                            <a href="/generated_videos/${request.result}" target="_blank" class="text-purple-400 hover:text-purple-300 flex items-center">
                                <i data-lucide="external-link" class="w-4 h-4 mr-2"></i>
                                View Generated Video
                            </a>
                        </div>
                    </div>
                ` : `
                    <div>
                        <h4 class="font-semibold text-purple-300 mb-2">Result</h4>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                            <p class="text-gray-400">No result available yet</p>
                        </div>
                    </div>
                `}
            </div>
        `;
        
        // Save current scroll position
        window.modalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${window.modalScrollPosition}px`;
        document.body.style.width = '100%';
        
        detailModal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    // Global function for pagination
    window.changeMyPage = function(page) {
        currentPage = page;
        loadMyRequests();
    };
    
    // Load my video statistics function
    async function loadMyVideoStats() {
        const statsLoadingState = document.getElementById('my-stats-loading-state');
        const statsErrorState = document.getElementById('my-stats-error-state');
        const statsContainer = document.getElementById('my-stats-container');
        
        // Check if user has access (multiple sources)
        let hasAccess = false;
        
        if (window.userSupporterAccess && window.userSupporterAccess.hasAccess && window.userSupporterAccess.accessLevel !== 'guest') {
            hasAccess = true;
        } else {
            // Check session/localStorage as fallback
            const storedLevel = sessionStorage.getItem('supporter_access_level') || localStorage.getItem('supporter_access_level');
            if (storedLevel && storedLevel !== 'guest' && userEmail) {
                hasAccess = true;
            }
        }
        
        if (!userEmail || !hasAccess) {
            if (statsLoadingState) statsLoadingState.classList.add('hidden');
            if (statsErrorState) statsErrorState.classList.remove('hidden');
            return;
        }
        
        // Show loading state
        if (statsLoadingState) statsLoadingState.classList.remove('hidden');
        if (statsErrorState) statsErrorState.classList.add('hidden');
        if (statsContainer) statsContainer.classList.add('hidden');
        
        try {
            const response = await fetch(`api/get_my_video_stats.php?user_email=${encodeURIComponent(userEmail)}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                displayMyVideoStats(result.data);
                
                // Show stats container
                if (statsLoadingState) statsLoadingState.classList.add('hidden');
                if (statsContainer) statsContainer.classList.remove('hidden');
            } else {
                throw new Error(result.error || 'Failed to load your statistics');
            }
        } catch (error) {
            console.error('Error loading my video stats:', error);
            
            // Show error state
            if (statsLoadingState) statsLoadingState.classList.add('hidden');
            if (statsErrorState) statsErrorState.classList.remove('hidden');
        }
    }
    
    // Display my video statistics
    function displayMyVideoStats(stats) {
        console.log('??? Displaying my video stats:', stats);
        
        // Update main stats
        const totalRequestsEl = document.getElementById('my-stat-total-requests');
        const processingEl = document.getElementById('my-stat-processing');
        const completedEl = document.getElementById('my-stat-completed');
        const failedEl = document.getElementById('my-stat-failed');
        const lastUpdatedEl = document.getElementById('my-stats-last-updated');
        
        // Animate counters for main stats
        if (totalRequestsEl) animateCounter(totalRequestsEl, stats.total_requests);
        if (processingEl) animateCounter(processingEl, stats.total_processing);
        if (completedEl) animateCounter(completedEl, stats.total_completed);
        if (failedEl) animateCounter(failedEl, stats.total_failed);
        
        // Update last updated
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = stats.last_updated_formatted || 'Unknown';
        }
    }
    
    // Animate counter for individual elements
    function animateCounter(element, targetValue) {
        if (!element || targetValue === undefined || targetValue === null) return;
        
        // Ensure targetValue is a number
        const target = parseInt(targetValue) || 0;
        const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        
        if (startValue === target) {
            element.textContent = target.toLocaleString();
            return;
        }
        
        const duration = 1000;
        const startTime = performance.now();
        
        const step = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * (target - startValue) + startValue);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(step);
    }
    
    // Add retry stats event listener
    const retryStatsBtn = document.getElementById('retry-my-stats');
    if (retryStatsBtn) {
        retryStatsBtn.addEventListener('click', () => loadMyVideoStats());
    }
    
    // Initial load
    loadMyVideoStats(); // Load stats first
    loadMyRequests();   // Then load requests
}

// Recent Video Requests functionality
function initializeRecentVideoRequests() {
    let currentPage = 1;
    let currentLimit = 12;
    let currentFilters = {};
    
    // Get DOM elements
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const contentContainer = document.getElementById('content-container');
    const requestsGrid = document.getElementById('requests-grid');
    const paginationContainer = document.getElementById('pagination-container');
    const refreshBtn = document.getElementById('refresh-requests');
    const retryBtn = document.getElementById('retry-load');
    const retryStatsBtn = document.getElementById('retry-stats');
    const detailModal = document.getElementById('request-detail-modal');
    const closeDetailModal = document.getElementById('close-detail-modal');
    
    // Event listeners
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadRequests());
    }
    
    if (retryStatsBtn) {
        retryStatsBtn.addEventListener('click', () => loadVideoStats());
    }
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => loadRequests());
    }
    
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', () => {
            closeModal();
        });
    }
    
    // Close modal when clicking outside
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal || e.target.closest('.absolute') === null) {
                closeModal();
            }
        });
    }
    
    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Close modal function
    function closeModal() {
        detailModal.classList.add('hidden');
        // Re-enable body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        
        // Restore scroll position if saved
        if (window.modalScrollPosition !== undefined) {
            window.scrollTo(0, window.modalScrollPosition);
            delete window.modalScrollPosition;
        }
    }
    
    // Load requests function
    async function loadRequests() {
        showLoading();
        
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: currentLimit,
                ...currentFilters
            });
            
            const response = await fetch(`api/get_all_video_requests.php?${params}`);
            const result = await response.json();
            
            if (result.success) {
                // Limit to maximum 4 pages
                const maxPages = 4;
                if (result.pagination.total_pages > maxPages) {
                    result.pagination.total_pages = maxPages;
                    result.pagination.has_next = currentPage < maxPages;
                }
                
                displayRequests(result.data);
                displayPagination(result.pagination);
                showContent();
            } else {
                showError();
            }
        } catch (error) {
            console.error('Error loading requests:', error);
            showError();
        }
    }
    
    // Display functions
    function showLoading() {
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        contentContainer.classList.add('hidden');
    }
    
    function showError() {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        contentContainer.classList.add('hidden');
    }
    
    function showContent() {
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    }
    
    function displayRequests(requests) {
        if (!requestsGrid) return;
        
        if (requests.length === 0) {
            requestsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="glass-effect rounded-lg p-8 border border-gray-600">
                        <i data-lucide="video-off" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                        <p class="text-gray-400">No video requests found</p>
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        
        requestsGrid.innerHTML = requests.map(request => createRequestCard(request)).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Add click listeners to cards
        requests.forEach(request => {
            const card = document.getElementById(`request-${request.id}`);
            if (card) {
                card.addEventListener('click', () => showRequestDetail(request));
            }
        });
    }
    
    function createRequestCard(request) {
        return `
            <div id="request-${request.id}" class="glass-effect rounded-lg p-4 border border-gray-600 hover:border-orange-400 transition-colors cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded text-xs font-medium ${request.status_color}">
                            ${request.status_display}
                        </span>
                        <span class="px-2 py-1 rounded text-xs bg-blue-400 bg-opacity-20 text-blue-300">
                            ${request.type_display}
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="text-sm text-gray-300 line-clamp-3">${request.description_short}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                    <div class="flex items-center">
                        <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                        ${request.duration_target}s
                    </div>
                    <div class="flex items-center">
                        <i data-lucide="palette" class="w-3 h-3 mr-1"></i>
                        ${request.style_display || 'From Image'}
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Created: ${request.created_at_formatted}</span>
                    ${request.has_result ? '<span class="text-green-400">‚?? Has Result</span>' : ''}
                </div>
                
                <div class="text-xs text-gray-400 font-mono">
                    #${request.id.substring(0, 6)}...
                </div>
            </div>
        `;
    }
    
    function displayPagination(pagination) {
        if (!paginationContainer || !pagination) return;
        
        const { current_page, total_pages, has_prev, has_next } = pagination;
        
        if (total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="flex items-center space-x-2">';
        
        // Previous button
        if (has_prev) {
            paginationHTML += `
                <button onclick="changePage(${current_page - 1})" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === current_page;
            paginationHTML += `
                <button onclick="changePage(${i})" class="px-3 py-1 ${isActive ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded transition-colors">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (has_next) {
            paginationHTML += `
                <button onclick="changePage(${current_page + 1})" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    function showRequestDetail(request) {
        const modalContent = document.getElementById('modal-content');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="space-y-6">
                <!-- Request Info -->
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-orange-300 mb-2">Request Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-gray-400">ID:</span> <span class="text-white">#${request.id}</span></div>
                            <div><span class="text-gray-400">Status:</span> <span class="px-2 py-1 rounded text-xs ${request.status_color}">${request.status_display}</span></div>
                            <div><span class="text-gray-400">Type:</span> <span class="text-blue-300">${request.type_display}</span></div>
                            <div><span class="text-gray-400">Duration:</span> <span class="text-white">${request.duration_target} seconds</span></div>
                            <div><span class="text-gray-400">Style:</span> <span class="text-white">${request.style_display}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-orange-300 mb-2">Timestamps</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-gray-400">Created:</span> <span class="text-white">${request.created_at_formatted}</span></div>
                            <div><span class="text-gray-400">Updated:</span> <span class="text-white">${request.updated_at_formatted}</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Full Description -->
                <div>
                    <h4 class="font-semibold text-orange-300 mb-2">Full Description</h4>
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                        <p class="text-gray-300 whitespace-pre-wrap">${request.description}</p>
                    </div>
                </div>
                
                <!-- Result -->
                ${request.has_result ? `
                    <div>
                        <h4 class="font-semibold text-orange-300 mb-2">Result</h4>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                            <a href="/generated_videos/${request.result}" target="_blank" class="text-blue-400 hover:text-blue-300 flex items-center">
                                <i data-lucide="external-link" class="w-4 h-4 mr-2"></i>
                                View Generated Video
                            </a>
                        </div>
                    </div>
                ` : `
                    <div>
                        <h4 class="font-semibold text-orange-300 mb-2">Result</h4>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                            <p class="text-gray-400">No result available yet</p>
                        </div>
                    </div>
                `}
            </div>
        `;
        
        // Save current scroll position
        window.modalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Prevent body scroll when modal is open (mobile-friendly approach)
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${window.modalScrollPosition}px`;
        document.body.style.width = '100%';
        
        detailModal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    // Global function for pagination
    window.changePage = function(page) {
        currentPage = page;
        loadRequests();
    };
    
    // Load video statistics function
    async function loadVideoStats() {
        const statsLoadingState = document.getElementById('stats-loading-state');
        const statsErrorState = document.getElementById('stats-error-state');
        const statsContainer = document.getElementById('stats-container');
        
        // Show loading state
        if (statsLoadingState) statsLoadingState.classList.remove('hidden');
        if (statsErrorState) statsErrorState.classList.add('hidden');
        if (statsContainer) statsContainer.classList.add('hidden');
        
        try {
            const response = await fetch('api/get_video_request_stats.php');
            const result = await response.json();
            
            if (result.success && result.data) {
                displayVideoStats(result.data);
                
                // Show stats container
                if (statsLoadingState) statsLoadingState.classList.add('hidden');
                if (statsContainer) statsContainer.classList.remove('hidden');
            } else {
                throw new Error(result.error || 'Failed to load statistics');
            }
        } catch (error) {
            console.error('Error loading video stats:', error);
            
            // Show error state
            if (statsLoadingState) statsLoadingState.classList.add('hidden');
            if (statsErrorState) statsErrorState.classList.remove('hidden');
        }
    }
    
    // Display video statistics
    function displayVideoStats(stats) {
        console.log('??? Displaying video stats:', stats);
        
        // Update main stats
        const totalRequestsEl = document.getElementById('stat-total-requests');
        const processingEl = document.getElementById('stat-processing');
        const processingRateEl = document.getElementById('stat-processing-rate');
        const completedEl = document.getElementById('stat-completed');
        const successRateEl = document.getElementById('stat-success-rate');
        const failedEl = document.getElementById('stat-failed');
        
        // Update detailed stats
        const completed2hEl = document.getElementById('stat-completed-2h');
        const imageToVideoEl = document.getElementById('stat-image-to-video');
        const textToVideoEl = document.getElementById('stat-text-to-video');
        const lastUpdatedEl = document.getElementById('stats-last-updated');
        
        console.log('??ç Stats values:', {
            total_requests: stats.total_requests,
            total_processing: stats.total_processing,
            total_completed: stats.total_completed,
            total_failed: stats.total_failed,
            completed_last_2h: stats.completed_last_2h,
            completed_image_to_video_last_2h: stats.completed_image_to_video_last_2h,
            completed_text_to_video_last_2h: stats.completed_text_to_video_last_2h
        });
        
        // Animate counters for main stats
        if (totalRequestsEl) animateCounter(totalRequestsEl, stats.total_requests);
        if (processingEl) animateCounter(processingEl, stats.total_processing);
        if (completedEl) animateCounter(completedEl, stats.total_completed);
        if (failedEl) animateCounter(failedEl, stats.total_failed);
        
        // Animate counters for detailed stats
        if (completed2hEl) animateCounter(completed2hEl, stats.completed_last_2h);
        if (imageToVideoEl) animateCounter(imageToVideoEl, stats.completed_image_to_video_last_2h);
        if (textToVideoEl) animateCounter(textToVideoEl, stats.completed_text_to_video_last_2h);
        
        // Update rates
        if (processingRateEl) {
            setTimeout(() => {
                processingRateEl.textContent = `${stats.processing_rate || 0}% of total`;
            }, 500);
        }
        if (successRateEl) {
            setTimeout(() => {
                successRateEl.textContent = `${stats.success_rate || 0}% success rate`;
            }, 500);
        }
        
        // Update last updated
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = stats.last_updated_formatted || 'Unknown';
        }
    }
    
    // Animate counter for individual elements
    function animateCounter(element, targetValue) {
        if (!element || targetValue === undefined || targetValue === null) return;
        
        // Ensure targetValue is a number
        const target = parseInt(targetValue) || 0;
        const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        
        if (startValue === target) {
            element.textContent = target.toLocaleString();
            return;
        }
        
        const duration = 1000;
        const startTime = performance.now();
        
        const step = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * (target - startValue) + startValue);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(step);
    }
    
    // Initial load
    loadVideoStats(); // Load stats first
    loadRequests();   // Then load requests
}

document.addEventListener('DOMContentLoaded', function() {
    // Load default tab (top supporters)
    loadTopSupporters();
    
    // Add tab event listeners
    const topTab = document.getElementById('tab-top');
    const recentTab = document.getElementById('tab-recent');
    
    if (topTab) {
        topTab.addEventListener('click', () => switchSupporterTab('top'));
    }
    
    if (recentTab) {
        recentTab.addEventListener('click', () => switchSupporterTab('recent'));
    }
    
    // Add retry button event listener
    const retryBtn = document.getElementById('retry-supporters');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            if (currentSupporterTab === 'top') {
                loadTopSupporters();
            } else {
                loadRecentSupporters();
            }
        });
    }
});
