// Analytics Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality - Same as landing page
    const hamburger = document.getElementById('hamburger');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navbar.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navbar.classList.remove('active');
            });
        });
    }

    // Initialize analytics dashboard
    initializeAnalytics();

    // Refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Refreshing...';
            setTimeout(() => {
                initializeAnalytics();
                refreshBtn.innerHTML = '<i class="bx bx-refresh"></i> Refresh';
            }, 1000);
        });
    }

    async function initializeAnalytics() {
        try {
            // Load all analytics data
            await Promise.all([
                loadStatistics(),
                loadMostReportedRoads(),
                loadMostUrgentRoads(),
                loadIssueTypesDistribution(),
                loadAffectedAreas(),
                loadRecentActivity()
            ]);

            console.log('✅ Analytics dashboard loaded successfully');
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
            showNotification('Failed to load analytics data', 'error');
        }
    }

    async function loadStatistics() {
        try {
            const statsResult = await DatabaseService.getReportStats();
            
            if (statsResult.success) {
                const stats = statsResult.data;
                
                // Update statistics cards
                document.getElementById('totalReports').textContent = stats.total || 0;
                document.getElementById('criticalReports').textContent = stats.byPriority?.Critical || 0;
                document.getElementById('recentReports').textContent = stats.recent || 0;
                
                // Calculate affected areas (approximate based on unique locations)
                const affectedCount = Math.min(stats.total, Math.ceil(stats.total * 0.7)); // Estimate
                document.getElementById('affectedAreas').textContent = affectedCount;
                
                console.log('📊 Statistics loaded:', stats);
            } else {
                // Demo mode - show sample stats
                document.getElementById('totalReports').textContent = '47';
                document.getElementById('criticalReports').textContent = '8';
                document.getElementById('recentReports').textContent = '12';
                document.getElementById('affectedAreas').textContent = '23';
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    async function loadMostReportedRoads() {
        try {
            const reportsResult = await DatabaseService.getAllReports();
            const container = document.getElementById('mostReportedList');
            
            if (reportsResult.success && reportsResult.data.length > 0) {
                // Group reports by location
                const locationCounts = {};
                reportsResult.data.forEach(report => {
                    const location = report.location_description || 'Unknown Location';
                    locationCounts[location] = (locationCounts[location] || 0) + 1;
                });

                // Sort by count and get top 5
                const sortedLocations = Object.entries(locationCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                container.innerHTML = sortedLocations.map((item, index) => 
                    createLeaderboardItem(index + 1, item[0], `${item[1]} reports`, item[1])
                ).join('');
            } else {
                // Demo data
                container.innerHTML = getDemoMostReported();
            }
        } catch (error) {
            console.error('Error loading most reported roads:', error);
            document.getElementById('mostReportedList').innerHTML = '<div class="loading">Error loading data</div>';
        }
    }

    async function loadMostUrgentRoads() {
        try {
            const reportsResult = await DatabaseService.getAllReports();
            const container = document.getElementById('mostUrgentList');
            
            if (reportsResult.success && reportsResult.data.length > 0) {
                // Filter for critical and high priority reports
                const urgentReports = reportsResult.data
                    .filter(report => ['Critical', 'High'].includes(report.priority))
                    .sort((a, b) => {
                        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    })
                    .slice(0, 5);

                container.innerHTML = urgentReports.map((report, index) => 
                    createUrgentItem(index + 1, report.location_description, report.issue_type, report.priority)
                ).join('');
            } else {
                // Demo data
                container.innerHTML = getDemoMostUrgent();
            }
        } catch (error) {
            console.error('Error loading most urgent roads:', error);
            document.getElementById('mostUrgentList').innerHTML = '<div class="loading">Error loading data</div>';
        }
    }

    async function loadIssueTypesDistribution() {
        try {
            const statsResult = await DatabaseService.getReportStats();
            const container = document.getElementById('issueTypesList');
            
            if (statsResult.success && statsResult.data.byIssueType) {
                const issueTypes = Object.entries(statsResult.data.byIssueType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                container.innerHTML = issueTypes.map((item, index) => 
                    createLeaderboardItem(index + 1, item[0], `${item[1]} reports`, item[1])
                ).join('');
            } else {
                // Demo data
                container.innerHTML = getDemoIssueTypes();
            }
        } catch (error) {
            console.error('Error loading issue types:', error);
            document.getElementById('issueTypesList').innerHTML = '<div class="loading">Error loading data</div>';
        }
    }

    async function loadAffectedAreas() {
        try {
            const reportsResult = await DatabaseService.getAllReports();
            const container = document.getElementById('affectedAreasList');
            
            if (reportsResult.success && reportsResult.data.length > 0) {
                // Extract area information from location descriptions
                const areaCounts = {};
                reportsResult.data.forEach(report => {
                    // Simple area extraction (you can make this more sophisticated)
                    const location = report.location_description || '';
                    const area = extractAreaFromLocation(location);
                    areaCounts[area] = (areaCounts[area] || 0) + 1;
                });

                const sortedAreas = Object.entries(areaCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                container.innerHTML = sortedAreas.map((item, index) => 
                    createLeaderboardItem(index + 1, item[0], `${item[1]} reports`, item[1])
                ).join('');
            } else {
                // Demo data
                container.innerHTML = getDemoAffectedAreas();
            }
        } catch (error) {
            console.error('Error loading affected areas:', error);
            document.getElementById('affectedAreasList').innerHTML = '<div class="loading">Error loading data</div>';
        }
    }

    async function loadRecentActivity() {
        try {
            const reportsResult = await DatabaseService.getAllReports();
            const container = document.getElementById('recentActivity');
            
            if (reportsResult.success && reportsResult.data.length > 0) {
                const recentReports = reportsResult.data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10);

                container.innerHTML = recentReports.map(report => 
                    createActivityItem(report)
                ).join('');
            } else {
                // Demo data
                container.innerHTML = getDemoRecentActivity();
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
            document.getElementById('recentActivity').innerHTML = '<div class="loading">Error loading data</div>';
        }
    }

    // Helper functions
    function createLeaderboardItem(rank, title, subtitle, count) {
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        return `
            <div class="leaderboard-item">
                <div class="item-rank ${rankClass}">#${rank}</div>
                <div class="item-info">
                    <div class="item-title">${title}</div>
                    <div class="item-subtitle">${subtitle}</div>
                </div>
                <div class="item-count">${count}</div>
            </div>
        `;
    }

    function createUrgentItem(rank, location, issueType, priority) {
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const priorityClass = priority.toLowerCase();
        return `
            <div class="leaderboard-item">
                <div class="item-rank ${rankClass}">#${rank}</div>
                <div class="item-info">
                    <div class="item-title">${location}</div>
                    <div class="item-subtitle">${issueType}</div>
                </div>
                <div class="item-priority priority-${priorityClass}">${priority}</div>
            </div>
        `;
    }

    function createActivityItem(report) {
        const timeAgo = getTimeAgo(new Date(report.created_at));
        const icon = getIssueIcon(report.issue_type);
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class='bx ${icon}'></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${report.issue_type} reported</div>
                    <div class="activity-details">${report.location_description}</div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }

    function extractAreaFromLocation(location) {
        // Simple area extraction - you can make this more sophisticated
        const words = location.split(' ');
        for (let word of words) {
            if (word.includes('St') || word.includes('Ave') || word.includes('Rd') || word.includes('Blvd')) {
                return word;
            }
        }
        return words[0] || 'Unknown Area';
    }

    function getIssueIcon(issueType) {
        const icons = {
            'Pothole': 'bx-error-circle',
            'Damaged Road': 'bx-construction',
            'Flooding': 'bx-water',
            'Traffic Light Issue': 'bx-traffic-cone',
            'Road Sign Issue': 'bx-error',
            'Other': 'bx-info-circle'
        };
        return icons[issueType] || 'bx-info-circle';
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    // Demo data functions
    function getDemoMostReported() {
        return `
            <div class="leaderboard-item">
                <div class="item-rank rank-1">#1</div>
                <div class="item-info">
                    <div class="item-title">Main Street & Oak Avenue</div>
                    <div class="item-subtitle">Multiple potholes reported</div>
                </div>
                <div class="item-count">12</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-2">#2</div>
                <div class="item-info">
                    <div class="item-title">Highway 101 Exit 15</div>
                    <div class="item-subtitle">Road surface damage</div>
                </div>
                <div class="item-count">8</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-3">#3</div>
                <div class="item-info">
                    <div class="item-title">Broadway & First Street</div>
                    <div class="item-subtitle">Traffic signal issues</div>
                </div>
                <div class="item-count">6</div>
            </div>
        `;
    }

    function getDemoMostUrgent() {
        return `
            <div class="leaderboard-item">
                <div class="item-rank rank-1">#1</div>
                <div class="item-info">
                    <div class="item-title">Downtown Bridge</div>
                    <div class="item-subtitle">Structural damage</div>
                </div>
                <div class="item-priority priority-critical">Critical</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-2">#2</div>
                <div class="item-info">
                    <div class="item-title">School Zone - Elm Street</div>
                    <div class="item-subtitle">Missing stop sign</div>
                </div>
                <div class="item-priority priority-high">High</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-3">#3</div>
                <div class="item-info">
                    <div class="item-title">Interstate Junction</div>
                    <div class="item-subtitle">Road flooding</div>
                </div>
                <div class="item-priority priority-high">High</div>
            </div>
        `;
    }

    function getDemoIssueTypes() {
        return `
            <div class="leaderboard-item">
                <div class="item-rank rank-1">#1</div>
                <div class="item-info">
                    <div class="item-title">Potholes</div>
                    <div class="item-subtitle">Most common road issue</div>
                </div>
                <div class="item-count">18</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-2">#2</div>
                <div class="item-info">
                    <div class="item-title">Damaged Road Surface</div>
                    <div class="item-subtitle">Cracks and deterioration</div>
                </div>
                <div class="item-count">12</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-3">#3</div>
                <div class="item-info">
                    <div class="item-title">Traffic Light Issues</div>
                    <div class="item-subtitle">Malfunctioning signals</div>
                </div>
                <div class="item-count">7</div>
            </div>
        `;
    }

    function getDemoAffectedAreas() {
        return `
            <div class="leaderboard-item">
                <div class="item-rank rank-1">#1</div>
                <div class="item-info">
                    <div class="item-title">Downtown District</div>
                    <div class="item-subtitle">Central business area</div>
                </div>
                <div class="item-count">15</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-2">#2</div>
                <div class="item-info">
                    <div class="item-title">Residential North</div>
                    <div class="item-subtitle">Suburban neighborhoods</div>
                </div>
                <div class="item-count">11</div>
            </div>
            <div class="leaderboard-item">
                <div class="item-rank rank-3">#3</div>
                <div class="item-info">
                    <div class="item-title">Industrial Zone</div>
                    <div class="item-subtitle">Manufacturing district</div>
                </div>
                <div class="item-count">8</div>
            </div>
        `;
    }

    function getDemoRecentActivity() {
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class='bx bx-error-circle'></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Pothole reported</div>
                    <div class="activity-details">Corner of 5th Street and Pine Avenue</div>
                </div>
                <div class="activity-time">2h ago</div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">
                    <i class='bx bx-construction'></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Road damage reported</div>
                    <div class="activity-details">Main Highway near Mile Marker 15</div>
                </div>
                <div class="activity-time">4h ago</div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">
                    <i class='bx bx-traffic-cone'></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Traffic light issue reported</div>
                    <div class="activity-details">Downtown intersection - Broadway & 1st</div>
                </div>
                <div class="activity-time">6h ago</div>
            </div>
        `;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class='bx ${type === 'error' ? 'bx-error' : 'bx-info-circle'}'></i>
            <span>${message}</span>
            <button class="close-notification"><i class='bx bx-x'></i></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }
});
