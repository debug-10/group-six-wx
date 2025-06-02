type CategoryVO = {
  id: number
  name: string
  cover: string
  createTime: string
}

interface NoteQuery {
  page: number
  limmit: number
  categoryId?: number
}

interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

interface NoteVO {
  id: number
  title: string
  content: string
  categoryId: number
  createTime: string
  updateTime: string
}

type NoteDetailVO = {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  createTime: string;
  nickname: string;
  avatar: string;
};

type PageParams = {
  page?: number;
  limit?: number;
};

type NoteList = {
  list: NoteVO[];
  total: number;
};

type NoteDTO = {
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  tags: string[];
};
