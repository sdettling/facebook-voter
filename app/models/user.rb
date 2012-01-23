class User < ActiveRecord::Base
  validates :fbid, uniqueness: true
end
