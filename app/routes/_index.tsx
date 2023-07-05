// @ts-nocheck
import { json } from "@remix-run/cloudflare";
import type {
  ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

const getWords = async (KV: {
  get: (id: string) => Promise<string>;
}): Promise<string[]> => {
  const wordsJson = await KV.get("codys-words");
  return JSON.parse(wordsJson);
};

const putWords = async (
  KV: {
    put: (id: string, value: string) => Promise<void>;
  },
  words: string[]
): Promise<void> => {
  await KV.put("codys-words", JSON.stringify(words));
};

export const loader = async ({ context }: LoaderArgs) => {
  const words = await getWords(context.env.WORDS);

  return json({
    words,
  });
};

export async function action({ context, request }: ActionArgs) {
  const body = await request.formData();
  const word = body.get("word")?.toString();

  const words = await getWords(context.env.WORDS);

  if (words && words.includes(word)) {
    return true;
  }

  const newWords = words ? [...words, word] : [word];

  await putWords(context.env.WORDS, newWords);

  return true;
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Bumblebee" }];
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Form method="POST" action="?index" reloadDocument>
        <input type="text" name="word" />
        <button type="submit">Submit</button>
      </Form>

      <h3>WORDS</h3>
      {data.words &&
        data.words.length &&
        data.words.map((word) => (
          <span style={{ display: "block" }} key={word}>
            {word}
          </span>
        ))}
    </div>
  );
}
