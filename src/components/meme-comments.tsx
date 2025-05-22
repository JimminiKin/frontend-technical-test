import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Flex,
  Input,
  VStack,
  Button,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { getMemeComments, createMemeComment } from "../api";
import { useAuthToken } from "../contexts/authentication";
import { MemeComment } from "./meme-comment";
import { useState } from "react";
import { useCurrentUser } from "../hooks/use-current-user";
import { ErrorBoundary } from "./error-boundary";

interface MemeCommentsProps {
  memeId: string;
}

const MemeCommentsContent: React.FC<MemeCommentsProps> = ({
  memeId,
}) => {
  const token = useAuthToken();
  const { currentUser } = useCurrentUser();
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["meme-comments", memeId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getMemeComments(token, memeId, pageParam);
      return {
        comments: response.results,
        nextPage: pageParam + 1,
        totalPages: Math.ceil(response.total / response.pageSize)
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextPage <= lastPage.totalPages ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });

  const { mutate: submitComment, error: submitError } = useMutation({
    mutationFn: async (content: string) => {
      await createMemeComment(token, memeId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meme-comments", memeId] });
    },
  });

  if (error) {
    throw error;
  }

  const comments = data?.pages.flatMap(page => page.comments) ?? [];

  return (
    <>
      <Box mb={6}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (commentContent) {
              submitComment(commentContent);
              setCommentContent("");
            }
          }}
        >
          <VStack spacing={2}>
            <Flex alignItems="center" width="full">
              <Avatar
                borderWidth="1px"
                borderColor="gray.300"
                name={currentUser?.username}
                src={currentUser?.pictureUrl}
                size="sm"
                mr={2}
              />
              <Input
                placeholder="Type your comment here..."
                onChange={(event) => setCommentContent(event.target.value)}
                value={commentContent}
              />
            </Flex>
            {submitError && (
              <Alert status="error" size="sm">
                <AlertIcon />
                Failed to post comment. Please try again.
              </Alert>
            )}
          </VStack>
        </form>
      </Box>
      <VStack align="stretch" spacing={4}>
        {isLoading ? (
          <Box p={2}>Loading comments...</Box>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <MemeComment
                key={comment.id}
                memeId={memeId}
                comment={comment}
              />
            ))}
            {hasNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                variant="ghost"
                size="sm"
                width="full"
                color="gray.500"
              >
                Load more comments
              </Button>
            )}
          </>
        ) : (
          <Text color="gray.500" p={2}>No comments yet. Be the first to comment!</Text>
        )}
      </VStack>
    </>
  );
};

export const MemeComments: React.FC<MemeCommentsProps> = (props) => {
  return (
    <ErrorBoundary>
      <MemeCommentsContent {...props} />
    </ErrorBoundary>
  );
}; 