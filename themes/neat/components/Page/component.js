export const component = () => {
  const name = "App";
  return {
    name: name,
    initialize: () => {
      console.log(`Initializing component "${name}"`); 
    },
    update: (context) => {
      console.log(`Updating component "${name}" with context:`, context); 
    }
  }
};