<body class="seocontent-info-card">
  <a
    href="#"
    class="facets-faceted-navigation-item-category-facet-group-expander"
    data-toggle="collapse"
    data-target="#dsc-content"
    data-type="collapse"
  >
    <i class="facets-faceted-navigation-item-category-facet-group-expander-icon"></i>
  </a>
  <div id="dsc-content" class="collapse in">{{{ contentDetails }}}</div>
</body>

<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension
  
  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder
  
  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme
  
  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->