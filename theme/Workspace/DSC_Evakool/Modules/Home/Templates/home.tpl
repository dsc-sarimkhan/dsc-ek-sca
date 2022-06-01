<div class="home">
	<div data-cms-area="home_cms_area_1" data-cms-area-filters="path"></div>

	<div class="home-banner-top">
		<!-- <p class="home-banner-top-message">
			{{translate 'Use promo code <strong>SCADEMO</strong> for <strong>30%</strong> off your purchase'}}
		</p> -->
	</div>

	<div data-cms-area="home_cms_area_2" data-cms-area-filters="path"></div>

	<div class="home-slider-container">
		<div class="home-image-slider">
			<ul data-slider class="home-image-slider-list">
				{{#each carouselImages}}
				<li>
					<div class="carousel-slider-div">
						<a href="{{this.url}}">
							<img style="width: 100%;height: auto;" src="{{resizeImage this.image ../imageHomeSize}}"
								alt="" />
						</a>
					</div>
				</li>
				{{else}}
				<li>
					<div class="home-slide-main-container">
						<div class="home-slide-image-container">
							<img src="{{getThemeAssetsPath (resizeImage 'img/carousel-home-1.png' ../imageHomeSize)}}"
								alt="" />
						</div>

						<div class="home-slide-caption">
							<h2 class="home-slide-caption-title">SAMPLE HEADLINE</h2>
							<p>Example descriptive text displayed on multiple lines.</p>
							<div class="home-slide-caption-button-container">
								<a href="/search" class="home-slide-caption-button">Shop Now</a>
							</div>
						</div>
					</div>
				</li>
				<li>
					<div class="home-slide-main-container">
						<div class="home-slide-image-container">
							<img src="{{getThemeAssetsPath (resizeImage 'img/carousel-home-2.png' ../imageHomeSize)}}"
								alt="" />
						</div>

						<div class="home-slide-caption">
							<h2 class="home-slide-caption-title">SAMPLE HEADLINE</h2>
							<p>Example descriptive text displayed on multiple lines.</p>
							<div class="home-slide-caption-button-container">
								<a href="/search" class="home-slide-caption-button">Shop Now</a>
							</div>
						</div>
					</div>
				</li>
				<li>
					<div class="home-slide-main-container">
						<div class="home-slide-image-container">
							<img src="{{getThemeAssetsPath (resizeImage 'img/carousel-home-3.png' ../imageHomeSize)}}"
								alt="" />
						</div>

						<div class="home-slide-caption">
							<h2 class="home-slide-caption-title">SAMPLE HEADLINE</h2>
							<p>Example descriptive text displayed on multiple lines.</p>
							<div class="home-slide-caption-button-container">
								<a href="/search" class="home-slide-caption-button">Shop Now</a>
							</div>
						</div>
					</div>
				</li>
				{{/each}}
			</ul>
		</div>
	</div>
	<br><br>
	<div data-cms-area="home_cms_area_3" data-cms-area-filters="path"></div>

	<div class="home-banner-main">
		{{#each bottomBannerImages}}
		<div class="col-xs-6 col-md-6">
			<div class="home-banner-main-cell-bg dsc-bottom-banner"
				style="background-image:url({{resizeImage this ../imageHomeSizeBottom}});">
			</div>
		</div>
		{{else}}
		<div class="col-xs-6 col-md-3">
			<div class="home-banner-main-cell-bg dsc-bottom-banner">
				<a href="/products/ice-boxes">
					<img src="{{getThemeAssetsPath (resizeImage 'img/ice-boxes.jpg' ../imageHomeSizeBottom)}}" alt="">
				</a>
				<!-- <div class="center-container">
					<h1>Ice Boxes</h1>
					<span>Evakool produce quality iceboxes that combine performance with durability</span><br><br>
					<a class="btn btn-primary" href="/products/ice-boxes">SHOP NOW</a>
				</div>
				<div class="mobile-container">
					<h2>Ice Boxes</h2>
					<a class="btn btn-primary" href="/products/ice-boxes">SHOP NOW</a>
				</div> -->
			</div>
		</div>
		<div class="col-xs-6 col-md-3">
			<div class="home-banner-main-cell-bg dsc-bottom-banner">
				<a href="/products/portable-fridge-freezers">
					<img src="{{getThemeAssetsPath (resizeImage 'img/portable-fridge-freezers.jpg' ../imageHomeSizeBottom)}}"
						alt="">
				</a>
				<!-- <div class="center-container">
					<h1>Portable Fridge Freezers</h1>
					<span>At Evakool, we produce high-quality and user-friendly portable camping fridges</span><br><br>
					<a class="btn btn-primary" href="/products/portable-fridge-freezers">SHOP NOW</a>
				</div>
				<div class="mobile-container">
					<h2>Portable Fridge Freezers</h2>
					<a class="btn btn-primary" href="/products/portable-fridge-freezers">SHOP NOW</a>
				</div> -->
			</div>
		</div>
		<div class="col-xs-6 col-md-3">
			<div class="home-banner-main-cell-bg dsc-bottom-banner">
				<a href="/products/caravan-fridge-freezers">
					<img src="{{getThemeAssetsPath (resizeImage 'img/caravan-fridge-freezers.jpg' ../imageHomeSizeBottom)}}"
						alt="">
				</a>
				<!-- <div class="center-container">
					<h1>Caravan Fridge Freezers</h1>
					<span>Evakool provide high-quality portable caravan fridges</span><br><br>
					<a class="btn btn-primary" href="/products/caravan-fridge-freezers">SHOP NOW</a>
				</div>
				<div class="mobile-container">
					<h2>Caravan Fridge Freezers</h2>
					<a class="btn btn-primary" href="/products/caravan-fridge-freezers">SHOP NOW</a>
				</div> -->
			</div>
		</div>
		<div class="col-xs-6 col-md-3">
			<div class="home-banner-main-cell-bg dsc-bottom-banner">
				<a href="/products/p-accessories">
					<img src="{{getThemeAssetsPath (resizeImage 'img/p-accessories.jpg' ../imageHomeSizeBottom)}}"
						alt="">
				</a>
				<!-- <div class="center-container">
					<h1>Product Accessories</h1>
					<span>Shop our range of Fridge and Icebox spare parts</span><br><br>
					<a class="btn btn-primary" href="/products/p-accessories">SHOP NOW</a>
				</div>
				<div class="mobile-container">
					<h2>Product Accessories</h2>
					<a class="btn btn-primary" href="/products/p-accessories">SHOP NOW</a>
				</div> -->
			</div>
		</div>
		<!--<div class="home-banner-main-cell-nth0">
			<div class="home-banner-main-cell-bg">
				<img src="{{getThemeAssetsPath (resizeImage 'img/banner-bottom-home-1.jpg' ../imageHomeSizeBottom)}}"
					alt="">
				<div class="home-banner-main-cell-text">EXAMPLE TEXT</div>
			</div>
		</div>
		<div class="home-banner-main-cell-nth1">
			<div class="home-banner-main-cell-bg">
				<img src="{{getThemeAssetsPath (resizeImage 'img/banner-bottom-home-2.jpg' ../imageHomeSizeBottom)}}"
					alt="">
				<div class="home-banner-main-cell-text">EXAMPLE TEXT</div>
			</div>
		</div>
		<div class="home-banner-main-cell-nth2">
			<div class="home-banner-main-cell-bg">
				<img src="{{getThemeAssetsPath (resizeImage 'img/banner-bottom-home-3.jpg' ../imageHomeSizeBottom)}}"
					alt="">
				<div class="home-banner-main-cell-text">EXAMPLE TEXT</div>
			</div>
		</div> -->
		{{/each}}
	</div>
	<br><br>

	<div class="dsc-lifestyle-content">
		<div class="row dsc-product-type">
			<h1>Fridges</h1>
		</div>
		<br>
		<div class="row">
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content">
					<a href="https://www.youtube.com/watch?v=aJWhUlC9Q1A&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image1.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content-text">
					<div class="row">
						<h2><a href="/products/portable-fridge-freezers/ff-infinity-fibreglass-series">INFINITY
								FIBREGLASS FRIDGE SERIES</a></h2>
					</div><br>
					<div class="content-details">
						The Infinity Fibreglass Fridge Series is an epic combination of premium fibreglass material and
						highly efficient refrigeration system. With first class insulation and a beautiful white gloss
						cabinet,the Infinity is unbeatable. As we like to call it at Evakool,
						Infinity - the Rolls Royce of refrigeration
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 col-md-6 pull-right nopadding">
				<div class="content">

					<a href="https://www.youtube.com/watch?v=zq-wJ7irJik&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image2.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 pull-left nopadding">
				<div class="content-text">
					<div class="row ">
						<h2><a href="https://www.evakool.com.au/products/portable-fridge-freezers/ff-down-under-series">DOWN UNDER SERIES</a>
						</h2>
					</div>
					<br>
					<div class="content-details">
						Manufactured locally on the Sunshine Coast in Queensland, this legendary portable fridge/freezer
						is seriously all about adventure. Powered by a Secop compressor and roll bond evaporated, the
						Down Under Series has unmatched performance. If you’re fair dinkum about a bloody good time,
						you’ll need a bloody good fridge/freezer!
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content">
					<a href="https://www.youtube.com/watch?v=RQW2VvlOlyc&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image3.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content-text">
					<div class="row ">
						<h2><a href="/products/portable-fridge-freezers/ff-travel-mate-series">TRAVELMATE SERIES</a>
						</h2>
					</div>
					<br>
					<div class="content-details">
						The Travelmate Series is a must-have for any outdoor adventure! This 12V portable fridge/freezer
						offers great value for money whilst never compromising on style. Famous for its completely
						removable lids, the Travelmate provides user flexibility. With a wide range of sizes, you will
						not be left disappointed.
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 col-md-6 pull-right nopadding">
				<div class="content">
					<a href="https://www.youtube.com/watch?v=VOlfVvf-4SY&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image4.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 pull-left nopadding">
				<div class="content-text">
					<div class="row ">
						<h2><a href="/products/caravan-fridge-freezers/cff-platinum-upright-series">PLATINUM SERIES</a>
						</h2>
					</div>
					<br>
					<div class="content-details">
						Drawing from decades of 12V refrigeration experience, the Platinum Series is not only stylish
						yet it has been specifically designed to provide maximise cooling capacity to suit the harsh
						Australian environment. Available in a caravan 95L or 110L and our unique 40L drawer fridge,
						this series is a must-have for any adventurer.
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content">

					
						<img
            src="{{getThemeAssetsPath (resizeImage 'img/homepage-image8.jpg' ../imageHomeSizeBottom)}}"
            alt=""
            class="homepage-image">
						
					
				</div>
			</div>
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content-text">
					<div class="row ">
						<h2><a href="/products/portable-fridge-freezers/ff-explorer-series">EXPLORER SERIES</a></h2>
					</div>
					<br>
					<div class="content-details">
						The Explorer will mountaineer through the roughest terrain and in
            the harshest Australian climate. Value-packed with features,this
            fridge freezer has a highly efficient refrigeration system featuring
            a Secop compressor and roll bond evaporator. Assembled &
            commissioned in Australia, take your next adventure seriously and
            Explore with EvaKool.
					</div>
				</div>
			</div>
		</div>
		<br><br>
		<div class="row dsc-product-type">
			<h1>Iceboxes</h1>
		</div>
		<br>
		<div class="row">
			<div class="col-xs-12 col-md-6 pull-right nopadding">
				<div class="content">

					<a href="https://www.youtube.com/watch?v=epnBaUb4tT8&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image6.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 pull-left nopadding">
				<div class="content-text">
					<div class="row ">
						<h2><a href="/products/ice-boxes/ib-infinity-fibreglass-series">INFINITY FIBREGLASS ICEBOX
								SERIES</a></h2>
					</div>
					<br>
					<div class="content-details">
						The infamous Infinity Fibreglass Icebox Series is renowned for its high quality fibreglass
						cabinet and thick insulation. With a unique combination of quality, durability and performance,
						the Infinity Series is ideal for all your camping, fishing and 4WD adventures.
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content">

					<a href="https://www.youtube.com/watch?v=6cYFDbzzoUc&ab_channel=EvaKoolAustralia" target="_blank">
						<img src="{{getThemeAssetsPath (resizeImage 'img/homepage-image7.jpg' ../imageHomeSizeBottom)}}"
							alt="" class="homepage-image">
						<div class="top">
							<div class="play-button-text"><i class="fa fa-youtube-play fa-2x"></i></div>
						</div>
					</a>
				</div>
			</div>
			<div class="col-xs-12 col-md-6 nopadding">
				<div class="content-text">
					<div class="row">
						<h2><a href="/products/ice-boxes/ib-icekool-series">ICEKOOL SERIES</a></h2>
					</div>
					<br>
					<div class="content-details">
						Affordable quality for every lifestyle, the Icekool Series is the perfect combination of
						quality, durability and performance. The iconic blue box has proudly served Australians for
						years! Whether you’re on your next fishing adventure or having a picnic, there’s a size for
						everyone. </div>
				</div>
			</div>
		</div>
	</div>


	<!-- <div class="dsc-home-content">
		<h1>Leading in Portable Coolers - Evakool</h1>
		<p style="line-height: 2.4em;"><span><strong>Products that have stood the test of time....</strong></span></p>
		<ul class="dsc-main-ul" style="line-height: 2.4em;">
			<li><span>Established for over 20 years</span></li>
			<li><span>Australia's largest manufacturer of 12 volt portable refrigeration</span></li>
			<li><span>With Australian manufacturing facilities, Evakool is able to offer customised 12 Volt refrigeration solutions</span></li>
			<li><span><span>Australia's largest manufacturer and distributor of fibreglass and polyethelene iceboxes, having sold over<strong>1 MILLION</strong> units worldwide.</span></span></li>
			<li><span>Nationwide service support for our wide range of products</span></li>
			<li><a href="/evakool-difference">Learn More</a></li>
		</ul>
	</div> -->

	<div data-cms-area="home_cms_area_4" data-cms-area-filters="path"></div>

	<div class="home-merchandizing-zone">
		<div data-id="your-merchandising-zone" data-type="merchandising-zone"></div>
	</div>
</div>

{{!----
Use the following context variables when customizing this template:

	imageHomeSize (String)
	imageHomeSizeBottom (String)
	carouselImages (Array)
	bottomBannerImages (Array)

----}}