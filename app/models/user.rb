class User < ActiveRecord::Base
  validates :name, :email, :fbid, uniqueness: true
end
