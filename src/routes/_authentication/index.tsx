import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { VStack, StackDivider } from "@chakra-ui/react";
import { getMemes } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { Meme } from "../../components/meme";
import { useState } from "react";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const { isLoading, data: memes } = useQuery({
    queryKey: ["memes"],
    queryFn: async () => {
      const memes = [];
      const firstPage = await getMemes(token, 1);
      memes.push(...firstPage.results);
      const remainingPages =
        Math.ceil(firstPage.total / firstPage.pageSize) - 1;
      for (let i = 0; i < remainingPages; i++) {
        const page = await getMemes(token, i + 2);
        memes.push(...page.results);
      }
      return memes.map(meme => ({
        ...meme,
        commentsCount: Number(meme.commentsCount)
      }));
    },
  });

  const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <VStack
      width="full"
      height="full"
      p={4}
      maxWidth={800}
      margin="0 auto"
      divider={<StackDivider border="gray.200" />}
      overflowY="auto"
    >
      {memes?.map((meme) => (
        <Meme
          key={meme.id}
          meme={meme}
          isCommentsOpen={openedCommentSection === meme.id}
          onCommentsToggle={() =>
            setOpenedCommentSection(
              openedCommentSection === meme.id ? null : meme.id
            )
          }
        />
      ))}
    </VStack>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
