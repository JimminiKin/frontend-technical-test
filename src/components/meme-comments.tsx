import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Flex,
  Input,
  VStack,
} from "@chakra-ui/react";
import { getMemeComments, createMemeComment } from "../api";
import { useAuthToken } from "../contexts/authentication";
import { MemeComment } from "./meme-comment";
import { useState } from "react";
import { useCurrentUser } from "../hooks/use-current-user";

interface MemeCommentsProps {
  memeId: string;
}

export const MemeComments: React.FC<MemeCommentsProps> = ({
  memeId,
}) => {
  const token = useAuthToken();
  const { currentUser } = useCurrentUser();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["meme-comments", memeId],
    queryFn: async () => {
      const comments = [];
      const firstPage = await getMemeComments(token, memeId, 1);
      comments.push(...firstPage.results);
      const remainingCommentPages =
        Math.ceil(firstPage.total / firstPage.pageSize) - 1;
      for (let i = 0; i < remainingCommentPages; i++) {
        const page = await getMemeComments(token, memeId, i + 2);
        comments.push(...page.results);
      }
      return comments;
    },
  });

  const { mutate: submitComment } = useMutation({
    mutationFn: async (content: string) => {
      await createMemeComment(token, memeId, content);
    },
  });

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
          <Flex alignItems="center">
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
        </form>
      </Box>
      <VStack align="stretch" spacing={4}>
        {isLoading ? (
          <Box p={2}>Loading comments...</Box>
        ) : (
          comments?.map((comment) => (
            <MemeComment
              key={comment.id}
              memeId={memeId}
              comment={comment}
            />
          ))
        )}
      </VStack>
    </>
  );
}; 