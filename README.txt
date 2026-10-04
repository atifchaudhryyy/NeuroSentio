NeuroSentio website - images
============================

The pages load the optimised copies in images/web/ (small, fast files).
The large originals stay in images/ as your master copies; the site does not load them.

images/web/ (used by the site)
  hero.jpg        home hero (desktop)            from images/hero.jpg
  about.jpg       home About + about.html hero   from images/about.png
  mission.jpg     about.html "Our Mission"       from images/Mission.png
  story.jpg       about.html "Our Story"         from images/story.png
  real-life.jpg   features.html "Built for Real Life"  from images/Built for Real Life.png
  contact.jpg     contact.html details card      from images/contact.png
  app-icon.png    download banner + features hero icon   from images/AppIcon.png
  logo.png        "A Closer Look" shield         from images/logo.png
  app-logo.png    header logo (white wordmark)   from images/AppLogo.png
  footer-logo.png footer logo / white header     from images/FooterLogo.png
  favicon.png     browser-tab icon (64x64)       from images/AppIcon.png
  og-image.jpg    link-preview image (1200x630) for WhatsApp, LinkedIn, X...

images/mobile/
  hero.webp       phone version of the home hero (used on screens up to 600px)

App screenshots (images/*.jpg, 720x1600) are used as-is; their top 80px status bar is cropped with CSS.

Replacing a photo: export it at about the same pixel size as the file in images/web/,
keep it under ~250 KB, and save it over that file (same name).