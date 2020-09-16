/* global workbox */

workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
workbox.routing.registerNavigationRoute(                                        
	workbox.precaching.getCacheKeyForURL('/index.html')    
)    


workbox.core.skipWaiting()

workbox.routing.registerRoute(    
	/\.js$/,    
	new workbox.strategies.NetworkFirst()    
)    

workbox.routing.registerRoute(    
	/\.html$/,    
	new workbox.strategies.NetworkFirst()    
)    

workbox.routing.registerRoute(    
	/\.css$/,    
	new workbox.strategies.NetworkFirst()    
)    

workbox.routing.registerRoute(    
	// Cache image files.    
	/\.(?:png|jpg|jpeg|svg|gif)$/,    
	new workbox.strategies.NetworkFirst()    
)

workbox.routing.registerRoute(
	// Cache image files.
	/\.(?:ttf|wot)$/,
	new workbox.strategies.CacheFirst()
)
