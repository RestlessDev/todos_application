let components = {
  "App": {
    "name": "App",
    "initialize": (id) => {
      console.log(`Initializing component "${name}" with id "${id}"`); 
    },
    "update": (id, context) => {
      console.log(`Updating component "${name}" with context:`, context); 
    },
    "template": "<div class=\"app <%= args.class %>\">\n  <div class=\"navbar\">\n  <% \n    function renderNavItem(navItem) {\n      let retval = `<li class=\"navitem\">`;\n      if(navItem.hasOwnProperty('href')) {\n        retval += `<a href=\"${navItem.href}\">`;\n      }\n      if(navItem.hasOwnProperty('label')) {\n        retval += `${navItem.label}`;\n      }\n      if(navItem.hasOwnProperty('href')) {\n        retval += `</a>`;\n      }\n      if(navItem.descendents.hasOwnProperty(\"NavItem\") && Array.isArray(navItem.descendents[\"NavItem\"])) {\n        retval += `<ul class=\"sub-navigation\">`\n        for(let j = 0; j < navItem.descendents[\"NavItem\"].length; j++) {\n          retval += renderNavItem(navItem.descendents[\"NavItem\"][j])\n        }  \n        retval += `</ul>`;\n      }\n      return retval;\n    }\n    if(args.descendents.hasOwnProperty(\"Navbar\") && Array.isArray(args.descendents['Navbar'])) { \n      let navBar = args.descendents['NavBar'][0];\n      if(navBar.descendents.hasOwnProperty('Logo') && Array.isArray(args.descendents['Logo']))  {\n        let logo = navBar.descendents['Logo'];\n        if(logo.src) {\n          %><img class=\"logo\" src=\"<%= logo.href %>\" title=\"<%= args.title %>\" /><%\n        }\n      }\n      if(navBar.descendents.hasOwnProperty(\"Navigation\") && Array.isArray(nabBar.descendents['Navigation'])) { \n        let navigation = navBar.descendents['Navigation'][0];\n        if(navigation.descendents.hasOwnProperty(\"NavItem\") && Array.isArray(navigation.descendents['NavItem'])) {\n          %><ul class=\"navigation\"><% \n          for(let i = 0; i < navigation.descendents['NavItem'].length; i++) {\n            %><%- renderNavItem(navigation.descendents['NavItem'][i]) %><%\n          }  \n          %></ul><%\n        }\n      %>\n    <% }\n      } %>\n    </div>\n    <h1><%= args.title %></h1>\n    <PageContent />\n</div>"
  },
  "Page": {
    "name": "Page",
    "initialize": (id) => {
      console.log(`Initializing component "${name}" with id "${id}"`); 
    },
    "update": (id, context) => {
      console.log(`Updating component "${name}" with id "${id}" and context:`, context); 
    },
    "template": "<div class=\"<%= args.class %> page-content\">\n  \n</div>"
  }
}