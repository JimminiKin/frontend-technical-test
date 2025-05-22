import { useQuery } from "@tanstack/react-query";
import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { format } from "timeago.js";
import { getUserById, GetMemeCommentsResponse } from "../api";
import { useAuthToken } from "../contexts/authentication";

interface MemeCommentProps {
  memeId: string;
  comment: GetMemeCommentsResponse["results"][0];
}

export const MemeComment: React.FC<MemeCommentProps> = ({ memeId, comment }) => {
  const token = useAuthToken();
  const { data: author, isLoading } = useQuery({
    queryKey: ["comment-author", comment.authorId],
    queryFn: async () => getUserById(token, comment.authorId),
  });

  if (isLoading || !author) {
    return (
      <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
        <Text color="gray.400">Loading comment...</Text>
      </Box>
    );
  }

  return (
    <Flex>
      <Avatar
        borderWidth="1px"
        borderColor="gray.300"
        size="sm"
        name={author.username}
        src={author.pictureUrl}
        mr={2}
      />
      <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex>
            <Text data-testid={`meme-comment-author-${memeId}-${comment.id}`}>
              {author.username}
            </Text>
          </Flex>
          <Text fontStyle="italic" color="gray.500" fontSize="small">
            {format(comment.createdAt)}
          </Text>
        </Flex>
        <Text
          color="gray.500"
          whiteSpace="pre-line"
          data-testid={`meme-comment-content-${memeId}-${comment.id}`}
        >
          {comment.content}
        </Text>
      </Box>
    </Flex>
  );
}; 