import { getTask, postResponse } from './helpers';

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("functions")) as {
      taskData: {
        image: string;
        text: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    const funSchema = {
      "name": "addUser",
      "description": "add user to database",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "provide name of user"
          },
          "surname": {
            "type": "string",
            "description": "provide surnname of user"
          },
          "year": {
            "type": "number",
            "description": "provide user year of birth"
          }
        }
      }
    }

    await postResponse(funSchema, token);
  } catch (error) {
    console.error('An error occurred:', (error as any).message);
    console.error(error)
  }
}

runTask();
