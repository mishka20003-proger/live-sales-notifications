/**
 * Purchase Notifications Widget
 * Shows real-time purchase notifications in storefront
 */

(function() {
  'use strict';

  const WIDGET_ID = 'purchase-notifications-widget';
  const API_POLL_INTERVAL = 15000; // Poll orders API every 15 seconds
  const SETTINGS_POLL_INTERVAL = 10000; // Poll settings every 10 seconds
  
  class PurchaseNotifications {
    constructor() {
      this.container = document.getElementById(WIDGET_ID);
      if (!this.container) return;

      this.config = {
        shop: this.container.dataset.shop,
        position: this.container.dataset.position || 'bottom-left',
        duration: parseInt(this.container.dataset.duration || '5') * 1000,
        interval: parseInt(this.container.dataset.interval || '10') * 1000,
        maxDisplay: parseInt(this.container.dataset.maxDisplay || '10'),
        enabled: true,
        dataSource: 'real',
        fakeInterval: 10,
        size: 'medium',
        showCustomerName: true,
        showOrderNumber: true,
        showTotalPrice: true,
        initialDelay: 5,
        hideOnMobile: false
      };

      this.orders = [];
      this.displayedOrders = new Set();
      this.currentIndex = 0;
      this.isShowing = false;
      this.settingsLoaded = false;
      this.notificationInterval = null;

      this.init();
    }

    async init() {
      console.log('🚀 Purchase Notifications Widget initialized');
      console.log('🏪 Shop:', this.config.shop);

      // Load settings from API first
      await this.loadSettings();

      // Check if notifications are enabled
      if (!this.config.enabled) {
        console.log('⏸️  Notifications are disabled in settings');
        return;
      }

      // Check if should hide on mobile
      if (this.config.hideOnMobile && window.innerWidth <= 768) {
        console.log('📱 Hiding notifications on mobile');
        return;
      }

      console.log('📍 Position:', this.config.position);
      console.log('📏 Size:', this.config.size);
      console.log('📊 Data Source:', this.config.dataSource);
      console.log('⏱️  Duration:', this.config.duration / 1000, 'seconds');

      // Apply position and size classes
      this.updateContainerClasses();

      // Start fetching orders
      this.fetchOrders();
      setInterval(() => this.fetchOrders(), API_POLL_INTERVAL);

      // Poll settings for updates
      setInterval(() => this.loadSettings(), SETTINGS_POLL_INTERVAL);

      // Start showing notifications after initial delay
      setTimeout(() => this.startNotificationCycle(), this.config.initialDelay * 1000);
    }

    updateContainerClasses() {
      this.container.className = `purchase-notifications ${this.config.position} size-${this.config.size}`;
    }

    async loadSettings() {
      try {
        console.log('⚙️  Loading settings from API...');
        const response = await fetch(`/apps/proxy/settings?shop=${this.config.shop}`);
        
        if (!response.ok) {
          console.warn('Failed to load settings, using defaults');
          return;
        }

        const settings = await response.json();
        
        // Store previous interval to detect changes
        const previousInterval = this.config.interval;
        const previousPosition = this.config.position;
        const previousSize = this.config.size;
        const previousDataSource = this.config.dataSource;
        const previousEnabled = this.config.enabled;
        
        // Merge settings with config
        this.config = {
          ...this.config,
          enabled: settings.enabled !== undefined ? settings.enabled : this.config.enabled,
          position: settings.position || this.config.position,
          duration: (settings.displayDuration || this.config.duration / 1000) * 1000,
          interval: (settings.displayInterval || this.config.interval / 1000) * 1000,
          maxDisplay: settings.maxNotifications || this.config.maxDisplay,
          dataSource: settings.dataSource || this.config.dataSource,
          fakeInterval: settings.fakeInterval || this.config.fakeInterval,
          size: settings.size || this.config.size,
          showCustomerName: settings.showCustomerName !== undefined ? settings.showCustomerName : this.config.showCustomerName,
          showOrderNumber: settings.showOrderNumber !== undefined ? settings.showOrderNumber : this.config.showOrderNumber,
          showTotalPrice: settings.showTotalPrice !== undefined ? settings.showTotalPrice : this.config.showTotalPrice,
          initialDelay: settings.initialDelay || this.config.initialDelay,
          hideOnMobile: settings.hideOnMobile || this.config.hideOnMobile
        };

        this.settingsLoaded = true;
        console.log('✅ Settings loaded:', this.config);

        // If interval changed in fake mode, restart notification cycle
        if (this.config.dataSource === 'fake' && previousInterval !== this.config.interval) {
          console.log('🔄 Fake interval changed, restarting cycle');
          this.restartNotificationCycle();
        }

        // If enabled changed from true to false, hide all notifications
        if (previousEnabled && !this.config.enabled) {
          console.log('⏸️  Notifications disabled, hiding all');
          this.hideAllNotifications();
        }

        // If position or size changed, update container classes
        if (previousPosition !== this.config.position || previousSize !== this.config.size) {
          console.log('🎨 Appearance changed, updating');
          this.updateContainerClasses();
        }

        // If dataSource changed, clear displayed orders to force refresh
        if (previousDataSource !== this.config.dataSource) {
          console.log('🔄 Data source changed:', this.config.dataSource);
          this.displayedOrders.clear();
          this.orders = [];
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    async fetchOrders() {
      try {
        // Use App Proxy endpoint
        const response = await fetch(`/apps/proxy/recent-orders?shop=${this.config.shop}`);
        
        if (!response.ok) {
          console.error('Failed to fetch orders:', response.status);
          return;
        }

        const data = await response.json();
        
        if (data.orders && data.orders.length > 0) {
          // Filter to only show orders we haven't shown yet
          const newOrders = data.orders.filter(order => 
            !this.displayedOrders.has(order.shopifyOrderId)
          );

          if (newOrders.length > 0) {
            console.log(`📦 Received ${newOrders.length} new orders`);
            this.orders = [...newOrders, ...this.orders].slice(0, this.config.maxDisplay);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }

    startNotificationCycle() {
      // Clear any existing interval
      if (this.notificationInterval) {
        clearInterval(this.notificationInterval);
      }

      // Determine interval based on data source
      const effectiveInterval = this.config.dataSource === 'fake' 
        ? this.config.fakeInterval * 1000 
        : this.config.interval;

      console.log(`🔄 Starting notification cycle (interval: ${effectiveInterval / 1000}s, mode: ${this.config.dataSource})`);

      // Show first notification
      this.showNextNotification();

      // Schedule subsequent notifications
      this.notificationInterval = setInterval(() => {
        if (!this.isShowing && this.config.enabled) {
          this.showNextNotification();
        }
      }, effectiveInterval);
    }

    restartNotificationCycle() {
      console.log('🔄 Restarting notification cycle');
      this.startNotificationCycle();
    }

    hideAllNotifications() {
      const notifications = this.container.querySelectorAll('.purchase-notification');
      notifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      });
      this.isShowing = false;
    }

    showNextNotification() {
      if (this.orders.length === 0) {
        console.log('⏸️  No orders to display');
        return;
      }

      // Get next order to display
      const order = this.orders[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.orders.length;

      // Mark as displayed
      this.displayedOrders.add(order.shopifyOrderId);

      // Create and show notification
      this.createNotification(order);
    }

    createNotification(order) {
      this.isShowing = true;

      // Create notification element
      const notification = document.createElement('div');
      notification.className = `purchase-notification size-${this.config.size}`;
      
      // Format customer name
      const customerName = order.customerName || 'Someone';
      
      // Product name (for fake orders) or fallback
      const productName = order.productName || '';
      
      // Format price
      const price = parseFloat(order.totalPrice).toFixed(2);

      // Time ago
      const timeAgo = this.getTimeAgo(new Date(order.createdAt));

      // Build notification parts based on settings
      let headerText = '';
      if (this.config.showCustomerName) {
        headerText = `<strong>${this.escapeHtml(customerName)}</strong> just purchased`;
      } else {
        headerText = 'Someone just purchased';
      }

      let productInfo = '';
      if (productName && productName.length > 0) {
        // Show product name for fake orders
        productInfo = `<div class="notification-product">${this.escapeHtml(productName)}</div>`;
      } else if (this.config.showOrderNumber) {
        // Fallback to order number for real orders
        productInfo = `<div class="notification-product">Order ${order.orderNumber}</div>`;
      }

      let priceInfo = '';
      if (this.config.showTotalPrice) {
        priceInfo = `<span class="notification-price">${price} ${order.currency}</span>`;
      }

      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">🛍️</div>
          <div class="notification-text">
            <div class="notification-header">${headerText}</div>
            ${productInfo}
            <div class="notification-meta">
              ${priceInfo}
              <span class="notification-time">${timeAgo}</span>
            </div>
          </div>
          <button class="notification-close" aria-label="Close">&times;</button>
        </div>
      `;

      // Add to container
      this.container.appendChild(notification);

      // Trigger animation
      setTimeout(() => notification.classList.add('show'), 100);

      // Setup close button
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => this.hideNotification(notification));

      // Auto-hide after duration
      setTimeout(() => {
        this.hideNotification(notification);
      }, this.config.duration);

      console.log(`✅ Showing notification for order ${order.orderNumber}`);
    }

    hideNotification(notification) {
      notification.classList.remove('show');
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.isShowing = false;
      }, 300); // Match CSS transition duration
    }

    getTimeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      return `${Math.floor(seconds / 86400)} days ago`;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PurchaseNotifications());
  } else {
    new PurchaseNotifications();
  }
})();

