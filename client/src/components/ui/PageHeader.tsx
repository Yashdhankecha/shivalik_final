
import { Group, Title, Text, Box } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <Box mb="xl">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={1} size="h2" mb={4}>
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Group>
    </Box>
  );
};
