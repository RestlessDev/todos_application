exports.component = component = () => {
  const name = "App";
  return {
    name: name,
    initialize: (id) => {
      console.log(`Initializing component "${name}" with id "${id}"`); 
    },
    update: (id, context) => {
      console.log(`Updating component "${name}" with context:`, context); 
    }
  }
};