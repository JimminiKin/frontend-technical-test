import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { VStack, StackDivider, Button, Text, Flex, Spinner } from "@chakra-ui/react";
import { getMemes } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { Meme } from "../../components/meme";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["memes"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getMemes(token, pageParam);
      return {
        memes: response.results.map(meme => ({
          ...meme,
          commentsCount: Number(meme.commentsCount)
        })),
        nextPage: pageParam + 1,
        totalPages: Math.ceil(response.total / response.pageSize)
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.nextPage <= lastPage.totalPages ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });

  const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  const memes = data?.pages.flatMap(page => page.memes) ?? [];

  return (
    <VStack
      width="full"
      height="full"
      p={4}
      maxWidth={800}
      margin="0 auto"
      divider={<StackDivider border="gray.200" />}
      overflowY="auto"
      spacing={4}
    >
      {memes.map((meme) => (
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
      
      <Flex 
        ref={ref}
        justify="center"
        py={4}
        width="full"
      >
        {isFetchingNextPage ? (
          <Spinner size="sm" color="gray.500" />
        ) : hasNextPage ? (
          <Text color="gray.500">Loading more memes...</Text>
        ) : (
          <Text color="gray.500">No more memes to load</Text>
        )}
      </Flex>
    </VStack>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
